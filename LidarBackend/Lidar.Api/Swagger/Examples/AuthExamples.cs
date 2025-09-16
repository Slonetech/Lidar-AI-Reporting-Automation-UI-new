using Swashbuckle.AspNetCore.Filters;
using static Lidar.Api.Controllers.AuthController;

namespace Lidar.Api.Swagger.Examples
{
    public class RegisterRequestExample : IExamplesProvider<RegisterRequest>
    {
        public RegisterRequest GetExamples() => new("Demo Corp", "DEM-001", "owner@demo.local", "StrongPass!2025", "Owner Demo");
    }

    public class LoginRequestExample : IExamplesProvider<LoginRequest>
    {
        public LoginRequest GetExamples() => new("owner@demo.local", "StrongPass!2025");
    }

    public class RefreshRequestExample : IExamplesProvider<RefreshRequest>
    {
        public RefreshRequest GetExamples() => new("<refresh-token>");
    }

    public class AuthResponseExample : IExamplesProvider<AuthResponse>
    {
        public AuthResponse GetExamples() => new("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", System.DateTime.UtcNow.AddMinutes(30), "<refresh-token>");
    }
}


