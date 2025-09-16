using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Lidar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Lidar.Infrastructure.Identity
{
    public class TokenService : ITokenService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public TokenService(ApplicationDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        public Task<(string accessToken, DateTime expiresAt)> CreateAccessTokenAsync(Guid userId, Guid tenantId, string email, IEnumerable<string> roles, IEnumerable<Claim>? additionalClaims = null)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSection["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(int.TryParse(jwtSection["ExpireMinutes"], out var m) ? m : 60);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("tenantId", tenantId.ToString()),
                new Claim("userId", userId.ToString())
            };
            if (additionalClaims != null) claims.AddRange(additionalClaims);
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Task.FromResult((tokenString, expires));
        }

        public async Task<(RefreshToken created, string newRefreshToken)> RotateRefreshTokenAsync(Guid userId, string? replaceToken)
        {
            if (!string.IsNullOrWhiteSpace(replaceToken))
            {
                var existing = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == replaceToken);
                if (existing != null)
                {
                    existing.RevokedAt = DateTime.UtcNow;
                    existing.ReplacedByToken = GenerateSecureToken();
                }
            }

            var newToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = GenerateSecureToken(),
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            };
            _dbContext.RefreshTokens.Add(newToken);
            await _dbContext.SaveChangesAsync();
            return (newToken, newToken.Token);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token)
        {
            var existing = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
            if (existing == null || existing.IsRevoked) return false;
            existing.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            return await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
        }

        private static string GenerateSecureToken()
        {
            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}


