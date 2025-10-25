FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5556

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["BooksService.csproj", "."]
RUN dotnet restore "./BooksService.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "BooksService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BooksService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["dotnet", "BooksService.dll"]