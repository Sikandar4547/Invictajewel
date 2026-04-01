namespace InvictaJewel.API.Contracts;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, string TokenType = "Bearer");
