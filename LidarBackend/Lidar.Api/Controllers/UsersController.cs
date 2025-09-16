using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Lidar.Core.Services;
using Lidar.Infrastructure.Identity;
using Lidar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.Filters;

namespace Lidar.Api.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/users")]
    [ApiExplorerSettings(GroupName = "Users")]
    [Authorize(Policy = "RequireTenantAdmin")]
    [ApiVersion("1.0")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IAuditService _auditService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager, IAuditService auditService, ILogger<UsersController> logger)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _roleManager = roleManager;
            _auditService = auditService;
            _logger = logger;
        }

        public record CreateUserRequest(string Email, string Password, string DisplayName, string RoleName);
        public record UpdateUserRequest(string? DisplayName, string? Password, string[]? Roles);

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var tenantId = GetTenantId();
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?> { ["tenantId"] = tenantId, ["traceId"] = HttpContext.TraceIdentifier });
            var users = await _userManager.Users.Where(u => u.TenantId == tenantId).ToListAsync();
            var result = await Task.WhenAll(users.Select(async u => new
            {
                u.Id,
                u.Email,
                u.DisplayName,
                u.TenantId,
                Roles = await _userManager.GetRolesAsync(u)
            }));
            _logger.LogInformation("Listed {Count} users for tenant {TenantId}", result.Length, tenantId);
            return Ok(result);
        }

        [HttpPost]
        [SwaggerRequestExample(typeof(CreateUserRequest), typeof(Lidar.Api.Swagger.Examples.CreateUserRequestExample))]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var tenantId = GetTenantId();
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?> { ["tenantId"] = tenantId, ["traceId"] = HttpContext.TraceIdentifier });
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Email = request.Email,
                UserName = request.Email,
                DisplayName = request.DisplayName
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // Ensure role exists (scoped or global)
            if (!await _roleManager.RoleExistsAsync(request.RoleName))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = request.RoleName, TenantId = tenantId });
            }
            await _userManager.AddToRoleAsync(user, request.RoleName);

            await _auditService.LogAsync(GetUserIdOrNull(), tenantId, "UserCreated", nameof(ApplicationUser), user.Id.ToString(), null, JsonSerializer.Serialize(new { user.Email, user.DisplayName, Roles = new[] { request.RoleName } }));
            _logger.LogInformation("Created user {Email} in tenant {TenantId}", user.Email, tenantId);

            return CreatedAtAction(nameof(List), new { id = user.Id }, new { user.Id, user.Email, user.DisplayName });
        }

        [HttpPut("{id:guid}")]
        [SwaggerRequestExample(typeof(UpdateUserRequest), typeof(Lidar.Api.Swagger.Examples.UpdateUserRequestExample))]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
        {
            var tenantId = GetTenantId();
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?> { ["tenantId"] = tenantId, ["traceId"] = HttpContext.TraceIdentifier });
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound();

            var before = JsonSerializer.Serialize(new { user.DisplayName });

            if (!string.IsNullOrWhiteSpace(request.DisplayName))
            {
                user.DisplayName = request.DisplayName;
            }

            var errors = new System.Collections.Generic.List<IdentityError>();

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
                if (!passResult.Succeeded) errors.AddRange(passResult.Errors);
            }

            if (request.Roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                var toRemove = currentRoles.Except(request.Roles);
                var toAdd = request.Roles.Except(currentRoles);
                if (toRemove.Any())
                {
                    var resR = await _userManager.RemoveFromRolesAsync(user, toRemove);
                    if (!resR.Succeeded) errors.AddRange(resR.Errors);
                }
                foreach (var r in toAdd)
                {
                    if (!await _roleManager.RoleExistsAsync(r))
                    {
                        await _roleManager.CreateAsync(new ApplicationRole { Name = r, TenantId = tenantId });
                    }
                    var resA = await _userManager.AddToRoleAsync(user, r);
                    if (!resA.Succeeded) errors.AddRange(resA.Errors);
                }
            }

            if (errors.Any()) return BadRequest(errors);

            await _userManager.UpdateAsync(user);

            await _auditService.LogAsync(GetUserIdOrNull(), tenantId, "UserUpdated", nameof(ApplicationUser), user.Id.ToString(), before, JsonSerializer.Serialize(new { user.DisplayName, Roles = request.Roles }));
            _logger.LogInformation("Updated user {UserId} in tenant {TenantId}", user.Id, tenantId);

            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var tenantId = GetTenantId();
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?> { ["tenantId"] = tenantId, ["traceId"] = HttpContext.TraceIdentifier });
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound();
            var before = JsonSerializer.Serialize(new { user.LockoutEnabled, user.LockoutEnd });
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.MaxValue;
            await _userManager.UpdateAsync(user);
            await _auditService.LogAsync(GetUserIdOrNull(), tenantId, "UserDeactivated", nameof(ApplicationUser), user.Id.ToString(), before, JsonSerializer.Serialize(new { user.LockoutEnabled, user.LockoutEnd }));
            _logger.LogInformation("Deactivated user {UserId} in tenant {TenantId}", user.Id, tenantId);
            return NoContent();
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("tenantId")?.Value;
            if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Missing tenantId claim");
            }
            return tenantId;
        }

        private Guid? GetUserIdOrNull()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var id) ? id : (Guid?)null;
        }
    }
}


