using System;
using Microsoft.AspNetCore.Identity;

namespace Lidar.Infrastructure.Identity
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public Guid? TenantId { get; set; }
    }
}


