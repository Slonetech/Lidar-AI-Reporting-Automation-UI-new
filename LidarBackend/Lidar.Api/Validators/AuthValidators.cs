using FluentValidation;
using Lidar.Api.Controllers;

namespace Lidar.Api.Validators
{
    public class RegisterRequestValidator : AbstractValidator<AuthController.RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.TenantName).NotEmpty().MaximumLength(200);
            RuleFor(x => x.RegistrationNumber).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(12)
                .Matches("[A-Z]")
                .Matches("[a-z]")
                .Matches("[0-9]")
                .Matches("[\\W_]");
            RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);
        }
    }

    public class LoginRequestValidator : AbstractValidator<AuthController.LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }

    public class RefreshRequestValidator : AbstractValidator<AuthController.RefreshRequest>
    {
        public RefreshRequestValidator()
        {
            RuleFor(x => x.RefreshToken).NotEmpty();
        }
    }
}


