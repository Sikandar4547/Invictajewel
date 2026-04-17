using InvictaJewel.API.Contracts;
using InvictaJewel.API.Identity;
using InvictaJewel.API.Services;
using InvictaJewel.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    AdminTokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized();

        var valid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!valid)
            return Unauthorized();

        // Ensure Admin role exists
        if (!await roleManager.RoleExistsAsync(Roles.Admin))
        {
            await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
        }

        var roles = await userManager.GetRolesAsync(user);

        // If this is the first user and has no roles, assign Admin role
        if (!roles.Any() && !await userManager.Users.Where(u => u.Id != user.Id).AnyAsync(ct))
        {
            await userManager.AddToRoleAsync(user, Roles.Admin);
            roles = await userManager.GetRolesAsync(user);
        }

        var jwt = tokens.CreateToken(user.Id, user.Email ?? request.Email, roles);
        return Ok(new LoginResponse(jwt));
    }

    /// <summary>
    /// Bootstrap: register the first user as Admin when no accounts exist. Returns 403 after the first user is created.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> RegisterBootstrap([FromBody] RegisterBootstrapRequest request, CancellationToken ct)
    {
        if (await userManager.Users.AnyAsync(ct))
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and password are required.");

        var user = new ApplicationUser { UserName = request.Email.Trim(), Email = request.Email.Trim() };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        if (!await roleManager.RoleExistsAsync(Roles.Admin))
        {
            _ = await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
        }
        await userManager.AddToRoleAsync(user, Roles.Admin);

        var roles = await userManager.GetRolesAsync(user);
        var jwt = tokens.CreateToken(user.Id, user.Email ?? request.Email, roles);
        return Ok(new LoginResponse(jwt));
    }

    /// <summary>Only admins can create additional admin accounts.</summary>
    [HttpPost("register-admin")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and password are required.");

        var user = new ApplicationUser { UserName = request.Email.Trim(), Email = request.Email.Trim() };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        if (!await roleManager.RoleExistsAsync(Roles.Admin))
        {
            _ = await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
        }
        await userManager.AddToRoleAsync(user, Roles.Admin);
        return NoContent();
    }
}
