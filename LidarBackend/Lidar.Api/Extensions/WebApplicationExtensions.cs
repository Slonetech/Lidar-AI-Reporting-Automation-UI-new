using System.Threading.Tasks;
using Lidar.Infrastructure.Identity;
using Lidar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Lidar.Core.Services;
using System.Text.Json;

namespace Lidar.Api.Extensions
{
    public static class WebApplicationExtensions
    {
        public static async Task SeedDatabaseAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            await DbInitializer.SeedAsync(context, roleManager, userManager);

            // Additional demo seed
            var audit = scope.ServiceProvider.GetRequiredService<IAuditService>();

            var demoTenant = await context.Tenants.FirstOrDefaultAsync(t => t.Name == "Demo Corp");
            if (demoTenant == null)
            {
                demoTenant = new Lidar.Core.Entities.Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = "Demo Corp",
                    RegistrationNumber = "DEM-001",
                    IsActive = true
                };
                context.Tenants.Add(demoTenant);
                await context.SaveChangesAsync();
                await audit.LogAsync(null, demoTenant.Id, "SeedTenant", nameof(Lidar.Core.Entities.Tenant), demoTenant.Id.ToString(), null, JsonSerializer.Serialize(demoTenant));
            }

            // TenantAdmin for demo
            var tenantAdminEmail = "tenant.admin@demo.local";
            var ta = await userManager.FindByEmailAsync(tenantAdminEmail);
            if (ta == null)
            {
                ta = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    Email = tenantAdminEmail,
                    UserName = tenantAdminEmail,
                    EmailConfirmed = true,
                    DisplayName = "Demo Tenant Admin",
                    TenantId = demoTenant.Id
                };
                await userManager.CreateAsync(ta, "StrongPass!2025");
                if (!await roleManager.RoleExistsAsync("TenantAdmin"))
                {
                    await roleManager.CreateAsync(new ApplicationRole { Name = "TenantAdmin", TenantId = demoTenant.Id });
                }
                await userManager.AddToRoleAsync(ta, "TenantAdmin");
                await audit.LogAsync(ta.Id, demoTenant.Id, "SeedUser", nameof(ApplicationUser), ta.Id.ToString(), null, JsonSerializer.Serialize(new { ta.Email, Roles = new[] { "TenantAdmin" } }));
            }

            // FinanceUser for demo
            var financeEmail = "finance.user@demo.local";
            var fu = await userManager.FindByEmailAsync(financeEmail);
            if (fu == null)
            {
                fu = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    Email = financeEmail,
                    UserName = financeEmail,
                    EmailConfirmed = true,
                    DisplayName = "Demo Finance User",
                    TenantId = demoTenant.Id
                };
                await userManager.CreateAsync(fu, "StrongPass!2025");
                if (!await roleManager.RoleExistsAsync("FinanceUser"))
                {
                    await roleManager.CreateAsync(new ApplicationRole { Name = "FinanceUser", TenantId = demoTenant.Id });
                }
                await userManager.AddToRoleAsync(fu, "FinanceUser");
                await audit.LogAsync(fu.Id, demoTenant.Id, "SeedUser", nameof(ApplicationUser), fu.Id.ToString(), null, JsonSerializer.Serialize(new { fu.Email, Roles = new[] { "FinanceUser" } }));
            }
        }
    }
}


