using Microsoft.AspNetCore.Identity;

namespace InvictaJewel.API.Identity;

public static class IdentitySeeder
{
    public static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager, CancellationToken ct = default)
    {
        if (!await roleManager.RoleExistsAsync(Roles.Admin))
            await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
    }
}
