using System;

namespace Lidar.Core.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? BeforeJson { get; set; }
        public string? AfterJson { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}


