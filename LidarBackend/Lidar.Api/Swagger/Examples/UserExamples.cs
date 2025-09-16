using Swashbuckle.AspNetCore.Filters;
using static Lidar.Api.Controllers.UsersController;

namespace Lidar.Api.Swagger.Examples
{
    public class CreateUserRequestExample : IExamplesProvider<CreateUserRequest>
    {
        public CreateUserRequest GetExamples() => new("analyst@demo.local", "StrongPass!2025", "Analyst Demo", "ReadOnly");
    }

    public class UpdateUserRequestExample : IExamplesProvider<UpdateUserRequest>
    {
        public UpdateUserRequest GetExamples() => new("Analyst X", null, new[] { "ReadOnly" });
    }
}


