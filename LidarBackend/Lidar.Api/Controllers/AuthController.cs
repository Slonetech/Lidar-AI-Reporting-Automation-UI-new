using System;
using System.Linq;
using System.Threading.Tasks;
using Lidar.Core.Entities;
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
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiExplorerSettings(GroupName = "Auth")]
    [ApiVersion("1.0")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ITokenService _tokenService;
        private readonly IAuditService _auditService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager, ITokenService tokenService, IAuditService auditService, ILogger<AuthController> logger)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
            _auditService = auditService;
            _logger = logger;
        }

        public record RegisterRequest(string TenantName, string RegistrationNumber, string Email, string Password, string DisplayName);
        public record AuthResponse(string AccessToken, DateTime ExpiresAt, string RefreshToken);
        public record LoginRequest(string Email, string Password);
        public record RefreshRequest(string RefreshToken);
        public record LogoutRequest(string RefreshToken);

        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [AllowAnonymous]
        [SwaggerRequestExample(typeof(RegisterRequest), typeof(Lidar.Api.Swagger.Examples.RegisterRequestExample))]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(Lidar.Api.Swagger.Examples.AuthResponseExample))]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?>
            {
                ["traceId"] = HttpContext.TraceIdentifier
            });
            if (await _dbContext.Tenants.AnyAsync(t => t.Name == request.TenantName))
                return BadRequest("Tenant already exists");

            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = request.TenantName,
                RegistrationNumber = request.RegistrationNumber,
                IsActive = true
            };
            _dbContext.Tenants.Add(tenant);
            await _dbContext.SaveChangesAsync();

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Email = request.Email,
                UserName = request.Email,
                DisplayName = request.DisplayName,
                EmailConfirmed = false
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync("TenantAdmin"))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = "TenantAdmin" });
            }
            await _userManager.AddToRoleAsync(user, "TenantAdmin");

            // Issue tokens
            var roles = await _userManager.GetRolesAsync(user);
            var (accessToken, expiresAt) = await _tokenService.CreateAccessTokenAsync(user.Id, tenant.Id, user.Email!, roles);
            var (_, refreshToken) = await _tokenService.RotateRefreshTokenAsync(user.Id, null);

            await _auditService.LogAsync(user.Id, tenant.Id, "RegisterTenant", nameof(Tenant), tenant.Id.ToString(), null, System.Text.Json.JsonSerializer.Serialize(new { tenant, user }));
            _logger.LogInformation("Register success for {Email} tenant {Tenant}", user.Email, tenant.Name);

            SetRefreshCookie(refreshToken);
            return Ok(new AuthResponse(accessToken, expiresAt, refreshToken));
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [AllowAnonymous]
        [SwaggerRequestExample(typeof(LoginRequest), typeof(Lidar.Api.Swagger.Examples.LoginRequestExample))]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(Lidar.Api.Swagger.Examples.AuthResponseExample))]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?>
            {
                ["traceId"] = HttpContext.TraceIdentifier
            });
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return Unauthorized();

            if (!await _userManager.CheckPasswordAsync(user, request.Password))
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);
            var (accessToken, expiresAt) = await _tokenService.CreateAccessTokenAsync(user.Id, user.TenantId, user.Email!, roles);
            var (_, refreshToken) = await _tokenService.RotateRefreshTokenAsync(user.Id, null);

            await _auditService.LogAsync(user.Id, user.TenantId, "Login", "Auth", user.Id.ToString(), null, null);
            _logger.LogInformation("Login success for {Email}", user.Email);

            SetRefreshCookie(refreshToken);
            return Ok(new AuthResponse(accessToken, expiresAt, refreshToken));
        }

        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [AllowAnonymous]
        [SwaggerRequestExample(typeof(RefreshRequest), typeof(Lidar.Api.Swagger.Examples.RefreshRequestExample))]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(Lidar.Api.Swagger.Examples.AuthResponseExample))]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?>
            {
                ["traceId"] = HttpContext.TraceIdentifier
            });
            var token = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);
            if (token == null || !token.IsActive)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(token.UserId.ToString());
            if (user == null)
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);
            var (accessToken, expiresAt) = await _tokenService.CreateAccessTokenAsync(user.Id, user.TenantId, user.Email!, roles);
            var (_, newRefresh) = await _tokenService.RotateRefreshTokenAsync(user.Id, token.Token);

            await _auditService.LogAsync(user.Id, user.TenantId, "RefreshToken", "Auth", user.Id.ToString(), token.Token, newRefresh);
            _logger.LogInformation("Refresh token rotated for {Email}", user.Email);

            SetRefreshCookie(newRefresh);
            return Ok(new AuthResponse(accessToken, expiresAt, newRefresh));
        }

        [HttpGet("confirm-email")]
        [AllowAnonymous]
        public IActionResult ConfirmEmail()
        {
            // Placeholder for now
            return Ok(new { message = "Email confirmation endpoint placeholder." });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            var success = await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken);
            if (!success) return BadRequest();
            Response.Cookies.Append("refresh_token", string.Empty, new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Expires = DateTimeOffset.UtcNow.AddDays(-1) });
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantIdClaim = User.FindFirst("tenantId")?.Value;
            if (Guid.TryParse(userIdClaim, out var uid) && Guid.TryParse(tenantIdClaim, out var tid))
            {
                await _auditService.LogAsync(uid, tid, "Logout", "Auth", uid.ToString(), null, null);
            }
            return Ok();
        }

        private void SetRefreshCookie(string refreshToken)
        {
            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(14)
            });
        }
    }
}


