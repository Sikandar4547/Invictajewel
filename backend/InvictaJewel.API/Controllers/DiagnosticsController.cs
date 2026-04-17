using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using InvictaJewel.Infrastructure.Identity;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/diagnostics")]
public class DiagnosticsController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("token-info")]
    [Authorize]
    public ActionResult GetTokenInfo()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        return Ok(new
        {
            authenticated = User.Identity?.IsAuthenticated,
            userId,
            email,
            roles,
            allClaims = claims
        });
    }

    [HttpGet("verify-admin-role")]
    [Authorize]
    public async Task<ActionResult> VerifyAdminRole(CancellationToken ct)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID not found in token");

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
            return BadRequest("User not found in database");

        var userRoles = await userManager.GetRolesAsync(user);
        var isAdmin = await userManager.IsInRoleAsync(user, "Admin");

        return Ok(new
        {
            userId,
            email = user.Email,
            userRoles,
            isAdminInDb = isAdmin,
            tokenRoles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList(),
            isAdminInToken = User.IsInRole("Admin")
        });
    }
}
