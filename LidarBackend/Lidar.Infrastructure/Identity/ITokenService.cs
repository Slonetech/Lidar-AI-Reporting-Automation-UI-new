using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Lidar.Infrastructure.Identity
{
    public interface ITokenService
    {
        Task<(string accessToken, DateTime expiresAt)> CreateAccessTokenAsync(Guid userId, Guid tenantId, string email, IEnumerable<string> roles, IEnumerable<Claim>? additionalClaims = null);
        Task<(RefreshToken created, string newRefreshToken)> RotateRefreshTokenAsync(Guid userId, string? replaceToken);
        Task<bool> RevokeRefreshTokenAsync(string token);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
    }
}


