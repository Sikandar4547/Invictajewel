using InvictaJewel.API.Contracts;
using InvictaJewel.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IConfiguration configuration, AdminTokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var email = configuration["Admin:Email"];
        var password = configuration["Admin:Password"];
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password) ||
            request.Email != email || request.Password != password)
            return Unauthorized();

        var token = tokens.CreateToken(request.Email);
        return Ok(new LoginResponse(token));
    }
}
