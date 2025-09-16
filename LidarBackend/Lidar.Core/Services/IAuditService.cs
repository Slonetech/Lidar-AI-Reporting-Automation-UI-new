using System;
using System.Threading.Tasks;

namespace Lidar.Core.Services
{
    public interface IAuditService
    {
        Task LogAsync(Guid? userId, Guid tenantId, string action, string entityType, string entityId, string? beforeJson, string? afterJson);
    }
}



