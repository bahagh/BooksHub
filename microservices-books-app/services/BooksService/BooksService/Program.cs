using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using FluentValidation;
using FluentValidation.AspNetCore;
using Serilog;
using BooksService.Data;
using BooksService.Services;
using BooksService.Validators;
using BooksService.DTOs;

// Clear default claim type mappings to ensure JWT claims are not modified
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/books-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Books Service API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? builder.Configuration["DATABASE_URL"]
    ?? throw new InvalidOperationException("Database connection string not configured");

builder.Services.AddDbContext<BooksDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

var symmetricKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
symmetricKey.KeyId = "BooksAppKey"; // Match the KeyId from UserService

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = symmetricKey,
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            // Fix for "kid is missing" error
            RequireSignedTokens = true,
            RequireExpirationTime = true,
            ValidateTokenReplay = false,
            TryAllIssuerSigningKeys = true
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                var authHeader = context.Request.Headers["Authorization"].ToString();
                logger.LogInformation("OnMessageReceived - Authorization header: {Header}", 
                    string.IsNullOrEmpty(authHeader) ? "MISSING" : authHeader.Substring(0, Math.Min(50, authHeader.Length)));
                logger.LogInformation("OnMessageReceived - Token: {Token}", 
                    string.IsNullOrEmpty(context.Token) ? "NOT EXTRACTED YET" : "Token present");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError("Authentication failed: {Error}", context.Exception.Message);
                logger.LogError("Authentication failed details: {Details}", context.Exception.ToString());
                logger.LogError("Exception type: {Type}", context.Exception.GetType().Name);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("Token validated successfully for user: {UserId}", 
                    context.Principal?.FindFirst("sub")?.Value ?? 
                    context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown");
                
                // Log all claims for debugging
                foreach (var claim in context.Principal?.Claims ?? new Claim[0])
                {
                    logger.LogInformation("Claim: {Type} = {Value}", claim.Type, claim.Value);
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Authorization challenge triggered: {Error}", context.Error);
                logger.LogWarning("Error Description: {ErrorDescription}", context.ErrorDescription);
                return Task.CompletedTask;
            }
        };
    });

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateBookDtoValidator>();

// Services
builder.Services.AddScoped<IBooksService, BooksService.Services.BooksService>();
builder.Services.AddScoped<IRatingsService, RatingsService>();
builder.Services.AddScoped<ICommentsService, CommentsService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<INotificationClient, NotificationClient>();

// HttpClient for UserService (for notifications)
builder.Services.AddHttpClient("UserService", client =>
{
    var userServiceUrl = builder.Configuration.GetValue<string>("UserServiceUrl") ?? "http://localhost:5555";
    client.BaseAddress = new Uri(userServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

// HttpClient for UserClient (for fetching user info)
builder.Services.AddHttpClient<IUserClient, UserClient>((serviceProvider, client) =>
{
    var userServiceUrl = builder.Configuration.GetValue<string>("UserServiceUrl") ?? "http://localhost:5555";
    client.BaseAddress = new Uri(userServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<BooksDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Books Service API v1");
    });
}

// Apply database migrations with error handling
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<BooksDbContext>();
        context.Database.Migrate(); // Apply migrations with proper table casing
        Log.Information("Database migrations applied successfully");
    }
}
catch (Exception ex)
{
    Log.Error(ex, "Database migration failed - this will cause errors!");
    throw; // Don't continue without database
}

app.UseSerilogRequestLogging();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

try
{
    Log.Information("Starting Books Service");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Books Service terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
