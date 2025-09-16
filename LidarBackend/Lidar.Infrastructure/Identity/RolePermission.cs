using System;
using Lidar.Core.Entities;

namespace Lidar.Infrastructure.Identity
{
    public class RolePermission
    {
        public Guid RoleId { get; set; }
        public int PermissionId { get; set; }

        public ApplicationRole? Role { get; set; }
        public Permission? Permission { get; set; }
    }
}


