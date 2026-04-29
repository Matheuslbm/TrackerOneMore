# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
# Render passes PORT; bind to it with a fallback
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENTRYPOINT ["dotnet", "Tracker.API.dll"]
