using FluentValidation;
using Lidar.Api.Controllers;

namespace Lidar.Api.Validators
{
    public class CreateUserRequestValidator : AbstractValidator<UsersController.CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(12)
                .Matches("[A-Z]")
                .Matches("[a-z]")
                .Matches("[0-9]")
                .Matches("[\\W_]");
            RuleFor(x => x.DisplayName).NotEmpty();
            RuleFor(x => x.RoleName).NotEmpty();
        }
    }

    public class UpdateUserRequestValidator : AbstractValidator<UsersController.UpdateUserRequest>
    {
        public UpdateUserRequestValidator()
        {
            RuleFor(x => x.DisplayName).MaximumLength(200).When(x => x.DisplayName != null);
            When(x => !string.IsNullOrEmpty(x.Password), () =>
            {
                RuleFor(x => x.Password!)
                    .MinimumLength(12)
                    .Matches("[A-Z]")
                    .Matches("[a-z]")
                    .Matches("[0-9]")
                    .Matches("[\\W_]");
            });
        }
    }
}


