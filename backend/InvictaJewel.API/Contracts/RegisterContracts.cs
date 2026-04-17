namespace InvictaJewel.API.Contracts;

/// <summary>Public bootstrap: only allowed when the user store is empty (creates first admin).</summary>
public record RegisterBootstrapRequest(string Email, string Password);

/// <summary>Only existing admins may call; creates another admin user.</summary>
public record RegisterAdminRequest(string Email, string Password);
