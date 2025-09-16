using System;
using System.Linq;
using Lidar.Core.Entities;
using Lidar.Infrastructure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Lidar.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor httpContextAccessor)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Tenant>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Name).HasMaxLength(200).IsRequired();
                entity.Property(t => t.RegistrationNumber).HasMaxLength(100);
                entity.HasQueryFilter(t => !t.IsDeleted);
                builder.Entity<ApplicationUser>()
                      .HasOne(u => u.Tenant!)
                      .WithMany()
                      .HasForeignKey(u => u.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<ApplicationUser>(entity =>
            {
                entity.HasIndex(u => new { u.TenantId, u.Email }).IsUnique(false);
            });

            builder.Entity<ApplicationRole>(entity =>
            {
                entity.HasIndex(r => new { r.TenantId, r.Name }).IsUnique(false);
            });

            builder.Entity<Permission>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).HasMaxLength(150).IsRequired();
            });

            builder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });
                entity.HasOne(rp => rp.Role)
                      .WithMany()
                      .HasForeignKey(rp => rp.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(rp => rp.Permission)
                      .WithMany()
                      .HasForeignKey(rp => rp.PermissionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Action).HasMaxLength(200);
                entity.Property(a => a.EntityType).HasMaxLength(200);
            });

            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.HasIndex(r => r.Token).IsUnique();
                entity.Property(r => r.Token).IsRequired();
                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Global query filters for TenantId isolation
            var tenantId = GetCurrentTenantId();
            if (tenantId != Guid.Empty)
            {
                builder.Entity<ApplicationUser>().HasQueryFilter(e => e.TenantId == tenantId);
                builder.Entity<ApplicationRole>().HasQueryFilter(e => e.TenantId == null || e.TenantId == tenantId);
                builder.Entity<RolePermission>().HasQueryFilter(e => true);
                builder.Entity<AuditLog>().HasQueryFilter(e => e.TenantId == tenantId);
                builder.Entity<Tenant>().HasQueryFilter(e => e.Id == tenantId);
            }
        }

        private Guid GetCurrentTenantId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var tenantClaim = httpContext?.User?.FindFirst("tenantId")?.Value;
            return Guid.TryParse(tenantClaim, out var tenantId) ? tenantId : Guid.Empty;
        }
    }
}


