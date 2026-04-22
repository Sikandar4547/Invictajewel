using System.Security.Claims;
using System.Text;
using AspNetCoreRateLimit;
using InvictaJewel.API.Identity;
using InvictaJewel.API.Options;
using InvictaJewel.API.Services;
using InvictaJewel.API.Swagger;
using InvictaJewel.Application;
using InvictaJewel.Infrastructure;
using InvictaJewel.Infrastructure.Identity;
using InvictaJewel.Infrastructure.Persistence;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

var jwt = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
          ?? throw new InvalidOperationException("Jwt configuration is missing.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = signingKey,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Email,
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Accept tokens whether the Authorization header contains the scheme or not,
                // and tolerate values like "Bearer Bearer {token}" if the token was pasted
                // including the scheme twice by mistake.
                var auth = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(auth))
                {
                    var token = auth.Trim();
                    // Strip repeated "Bearer " prefixes
                    while (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                        token = token.Substring("Bearer ".Length).Trim();
                    context.Token = token;
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetService<ILogger<Program>>();
                logger?.LogError(context.Exception, "JWT authentication FAILED: {Message}", context.Exception?.Message);
                logger?.LogError("Authorization header: {Auth}", context.Request.Headers["Authorization"].FirstOrDefault());
                return Task.CompletedTask;
            }
            ,OnTokenValidated = context =>
            {
                    var lg = context.HttpContext.RequestServices.GetService<ILogger<Program>>();
                    try
                    {
                        var user = context.Principal;
                        if (user == null)
                        {
                            lg?.LogWarning("Token validated but principal is null");
                            return Task.CompletedTask;
                        }
                        var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        var roles = user.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
                        lg?.LogInformation("JWT validated for user {UserId} with roles: {Roles}", id, string.Join(',', roles));
                        if (!roles.Any())
                            lg?.LogWarning("JWT contains no role claims");
                        else if (!user.IsInRole("Admin"))
                            lg?.LogWarning("User {UserId} is not in Admin role according to token roles", id);
                    }
                    catch (Exception ex)
                    {
                        lg?.LogWarning(ex, "Error while inspecting validated token");
                    }
                    return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Invicta Jewel API", Version = "v1" });
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Bearer. Example: `Bearer {token}`",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
    // Ignore IFormFile parameters - they'll be handled by OperationFilter
    c.IgnoreObsoleteProperties();
    c.IgnoreObsoleteActions();
    c.OperationFilter<SwaggerFileUploadFilter>();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddApplication();
var webRoot = builder.Environment.WebRootPath ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "products"));
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "banners"));
builder.Services.AddInfrastructure(builder.Configuration, webRoot);

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 8;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<AdminTokenService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await DbInitializer.MigrateAsync(db);
    await IdentitySeeder.EnsureRolesAsync(roleManager);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseIpRateLimiting();
app.UseHttpsRedirection();
app.UseStaticFiles();

// Routing must be enabled before authentication and authorization
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");


app.Run();
