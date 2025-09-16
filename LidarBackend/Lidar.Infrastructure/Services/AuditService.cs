using System;
using System.Threading.Tasks;
using Lidar.Core.Entities;
using Lidar.Core.Services;
using Lidar.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;

namespace Lidar.Infrastructure.Services
{
    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<AuditService> _logger;

        public AuditService(ApplicationDbContext dbContext, ILogger<AuditService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task LogAsync(Guid? userId, Guid tenantId, string action, string entityType, string entityId, string? beforeJson, string? afterJson)
        {
            var log = new AuditLog
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                BeforeJson = beforeJson,
                AfterJson = afterJson,
                Timestamp = DateTime.UtcNow
            };
            _dbContext.AuditLogs.Add(log);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("AuditLog {Action} {EntityType} {EntityId} by {UserId} in {TenantId}", action, entityType, entityId, userId, tenantId);
        }
    }
}


