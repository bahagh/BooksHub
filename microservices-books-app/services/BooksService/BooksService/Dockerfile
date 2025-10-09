FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["BooksService.csproj", "."]
RUN dotnet restore "./BooksService.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "BooksService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BooksService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BooksService.dll"]