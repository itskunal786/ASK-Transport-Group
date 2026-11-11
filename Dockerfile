# ==============================================================================
# ASK TRANSPORT GROUP - ASP.NET CORE (.NET 10) PRODUCTION DOCKERFILE
# Clean Architecture 6-Project Solution
# ==============================================================================

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files for caching restore layer
COPY ["ASK.Transport.slnx", "./"]
COPY ["ASK.Transport.Core/ASK.Transport.Core.csproj", "ASK.Transport.Core/"]
COPY ["ASK.Transport.Utils/ASK.Transport.Utils.csproj", "ASK.Transport.Utils/"]
COPY ["ASK.Transport.Logging/ASK.Transport.Logging.csproj", "ASK.Transport.Logging/"]
COPY ["ASK.Transport.Infrastructure/ASK.Transport.Infrastructure.csproj", "ASK.Transport.Infrastructure/"]
COPY ["ASK.Transport.Application/ASK.Transport.Application.csproj", "ASK.Transport.Application/"]
COPY ["ASK.Transport.Api/ASK.Transport.Api.csproj", "ASK.Transport.Api/"]

RUN dotnet restore "ASK.Transport.slnx"

# Copy the rest of the source code and publish API
COPY . .
RUN dotnet publish "ASK.Transport.Api/ASK.Transport.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

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

ENTRYPOINT ["dotnet", "ASK.Transport.Api.dll"]
