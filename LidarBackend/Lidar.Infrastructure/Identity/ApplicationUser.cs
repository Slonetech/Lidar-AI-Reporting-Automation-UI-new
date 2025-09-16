using System;
using Lidar.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace Lidar.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public Guid TenantId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Tenant? Tenant { get; set; }
    }
}


