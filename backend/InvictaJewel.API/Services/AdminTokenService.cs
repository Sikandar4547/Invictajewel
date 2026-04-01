using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InvictaJewel.API.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace InvictaJewel.API.Services;

public class AdminTokenService(IOptions<JwtSettings> jwtOptions)
{
    private readonly JwtSettings _jwt = jwtOptions.Value;

    public string CreateToken(string email)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, email),
            new(ClaimTypes.Role, "Admin"),
            new(JwtRegisteredClaimNames.Email, email)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            _jwt.Issuer,
            _jwt.Audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
