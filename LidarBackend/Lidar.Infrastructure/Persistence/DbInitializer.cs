using System;
using System.Threading.Tasks;
using Lidar.Core.Entities;
using Lidar.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Lidar.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(ApplicationDbContext context, RoleManager<ApplicationRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            await context.Database.MigrateAsync();

            string[] roles = new[] { "SystemAdmin", "TenantAdmin", "FinanceUser", "ReadOnly" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new ApplicationRole { Name = role });
                }
            }

            // Seed a default system tenant and admin user if none exists
            var systemTenant = await context.Tenants.FirstOrDefaultAsync(t => t.Name == "System");
            if (systemTenant == null)
            {
                systemTenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = "System",
                    RegistrationNumber = "SYS-000",
                    IsActive = true
                };
                context.Tenants.Add(systemTenant);
                await context.SaveChangesAsync();
            }

            var adminEmail = "admin@sasra.go.ke";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    Email = adminEmail,
                    UserName = adminEmail,
                    EmailConfirmed = true,
                    DisplayName = "System Admin",
                    TenantId = systemTenant.Id
                };
                await userManager.CreateAsync(adminUser, "ChangeThis!123");
                await userManager.AddToRoleAsync(adminUser, "SystemAdmin");
            }
        }
    }
}


