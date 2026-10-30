using ASK.Group.Api.Extensions;
using ASK.Group.Api.Hubs;
using ASK.Group.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// CLEAN ARCHITECTURE DEPENDENCY INJECTION LAYERS
// ============================================================================
// 1. Application Layer (Business Services, Use Cases, Workflows & Interfaces)
builder.Services.AddApplicationServices();

// 2. Infrastructure Layer (EF Core DbContext, Hosted Services, External Gateways)
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. Security & Governance Layer (JWT Auth, RBAC Policies, Rate Limiting, CORS)
builder.Services.AddSecurityServices(builder.Configuration, builder.Environment);

// 4. Presentation / Web API Layer (Controllers, OpenAPI Swagger, Health Checks)
builder.Services.AddApiPresentationServices(builder.Configuration);

var app = builder.Build();

// ============================================================================
// STARTUP VALIDATION & DATABASE PERSISTENCE INITIALIZATION
// ============================================================================
app.Services.GetRequiredService<StartupValidationService>().Validate();
await app.UseInfrastructurePersistenceAsync();

// ============================================================================
// HTTP PIPELINE, MIDDLEWARE & ROUTING
// ============================================================================
app.UseSecurityPipeline(app.Environment);
app.UseSwaggerDocumentation(builder.Configuration, app.Environment);

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

// Map Endpoints
app.MapControllers();
app.MapHub<OperationsHub>("/hubs/operations");
app.MapCustomHealthChecks();

app.Run();
