# ==============================================================================
# ASK TRANSPORT GROUP - ASP.NET CORE (.NET 10) PRODUCTION DOCKERFILE
# ==============================================================================

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["ASK.Group.Api.csproj", "./"]
RUN dotnet restore "ASK.Group.Api.csproj"

# Copy the rest of the source code and publish
COPY . .
RUN dotnet publish "ASK.Group.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================================================================
# RUNTIME CONTAINER
# ==============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5208

ENV ASPNETCORE_URLS=http://+:5208
ENV ASPNETCORE_ENVIRONMENT=Production

# Install curl for healthcheck
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5208/health || exit 1

ENTRYPOINT ["dotnet", "ASK.Group.Api.dll"]
