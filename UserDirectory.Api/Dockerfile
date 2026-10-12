FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["UserDirectory.Api.csproj", "./"]
RUN dotnet restore "UserDirectory.Api.csproj"

COPY . .
RUN dotnet publish "UserDirectory.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV Database__Path=/data/app.db

RUN mkdir -p /data

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "UserDirectory.Api.dll"]