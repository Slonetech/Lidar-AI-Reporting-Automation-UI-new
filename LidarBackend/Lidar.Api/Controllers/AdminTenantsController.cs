using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Lidar.Core.Entities;
using Lidar.Core.Services;
using Lidar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lidar.Api.Controllers
{
    [ApiController]
    [Route("api/admin/tenants")]
    [ApiExplorerSettings(GroupName = "Admin")]
    [Authorize(Policy = "RequireSystemAdmin")]
    [ApiVersion("1.0")]
    public class AdminTenantsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IAuditService _auditService;
        private readonly ILogger<AdminTenantsController> _logger;

        public AdminTenantsController(ApplicationDbContext dbContext, IAuditService auditService, ILogger<AdminTenantsController> logger)
        {
            _dbContext = dbContext;
            _auditService = auditService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            using var scope = _logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?> { ["traceId"] = HttpContext.TraceIdentifier });
            var tenants = await _dbContext.Tenants.IgnoreQueryFilters().AsNoTracking().ToListAsync();
            _logger.LogInformation("Listed {Count} tenants", tenants.Count);
            return Ok(tenants.Select(t => new { t.Id, t.Name, t.RegistrationNumber, t.IsActive, t.IsDeleted, t.CreatedAt }));
        }

        [HttpPut("{id:guid}/activate")]
        public async Task<IActionResult> Activate(Guid id, [FromQuery] bool active = true)
        {
            var tenant = await _dbContext.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
            if (tenant == null) return NotFound();
            var before = JsonSerializer.Serialize(new { tenant.IsActive });
            tenant.IsActive = active;
            await _dbContext.SaveChangesAsync();
            await _auditService.LogAsync(null, tenant.Id, active ? "TenantActivated" : "TenantDeactivated", nameof(Tenant), tenant.Id.ToString(), before, JsonSerializer.Serialize(new { tenant.IsActive }));
            _logger.LogInformation("Tenant {TenantId} active={Active}", tenant.Id, active);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> SoftDelete(Guid id)
        {
            var tenant = await _dbContext.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
            if (tenant == null) return NotFound();
            if (tenant.IsDeleted) return NoContent();
            var before = JsonSerializer.Serialize(new { tenant.IsDeleted });
            tenant.IsDeleted = true;
            await _dbContext.SaveChangesAsync();
            await _auditService.LogAsync(null, tenant.Id, "TenantSoftDeleted", nameof(Tenant), tenant.Id.ToString(), before, JsonSerializer.Serialize(new { tenant.IsDeleted }));
            _logger.LogInformation("Tenant {TenantId} soft-deleted", tenant.Id);
            return NoContent();
        }
    }
}


