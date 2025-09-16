using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Lidar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lidar.Api.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    [ApiExplorerSettings(GroupName = "Tenants")]
    [ApiVersion("1.0")]
    public class TenantsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<TenantsController> _logger;

        public TenantsController(ApplicationDbContext dbContext, ILogger<TenantsController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var tenantIdClaim = User.FindFirst("tenantId")?.Value;
            if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                return Unauthorized();
            }

            var tenant = await _dbContext.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) return NotFound();

            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?> { ["tenantId"] = tenant.Id, ["traceId"] = HttpContext.TraceIdentifier });
            _logger.LogInformation("Fetched tenant profile for {TenantId}", tenant.Id);

            return Ok(new
            {
                tenant.Id,
                tenant.Name,
                tenant.RegistrationNumber,
                tenant.IsActive,
                tenant.CreatedAt
            });
        }
    }
}


