using System.Data.Common;
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using UserDirectory.Api.Data;

namespace UserDirectory.Api.Tests;

public class UsersApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersApiTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessStatusCode()
    {
        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUser_WithNonExistingId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/users/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_WithInvalidNameAndAge_ReturnsBadRequest()
    {
        var invalidUser = new
        {
            name = "A",
            age = 150,
            city = "CA",
            state = "CA",
            pincode = "123456"
        };

        var response = await _client.PostAsJsonAsync("/api/users", invalidUser);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_WithoutAge_ReturnsBadRequest()
    {
        var userWithoutAge = new
        {
            name = "Test User",
            city = "Springfield",
            state = "IL",
            pincode = "62701"
        };

        var response = await _client.PostAsJsonAsync("/api/users", userWithoutAge);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_WithValidData_ReturnsCreated()
    {
        var validUser = new
        {
            name = "Test User",
            age = 25,
            city = "Springfield",
            state = "IL",
            pincode = "62701"
        };

        var response = await _client.PostAsJsonAsync("/api/users", validUser);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
    }

    [Fact]
    public async Task UpdateAndDeleteUser_ReturnExpectedStatuses()
    {
        var user = new
        {
            name = "Test User",
            age = 25,
            city = "Springfield",
            state = "IL",
            pincode = "62701"
        };
        var createResponse = await _client.PostAsJsonAsync("/api/users", user);
        var createdUser = await createResponse.Content.ReadFromJsonAsync<UserResponse>();

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.NotNull(createdUser);

        var updatedUser = new
        {
            name = "Updated User",
            age = 26,
            city = "Chicago",
            state = "IL",
            pincode = "60601"
        };

        var updateResponse = await _client.PutAsJsonAsync(
            $"/api/users/{createdUser.Id}",
            updatedUser);
        var getResponse = await _client.GetAsync($"/api/users/{createdUser.Id}");
        var retrievedUser = await getResponse.Content.ReadFromJsonAsync<UserResponse>();
        var deleteResponse = await _client.DeleteAsync($"/api/users/{createdUser.Id}");
        var deletedResponse = await _client.GetAsync($"/api/users/{createdUser.Id}");

        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Equal("Updated User", retrievedUser?.Name);
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, deletedResponse.StatusCode);
    }

    private sealed record UserResponse(int Id, string Name);
}

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(
        Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        _connection.Open();

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<DbConnection>();

            services.AddSingleton<DbConnection>(_connection);

            services.AddDbContext<AppDbContext>((serviceProvider, options) =>
            {
                var connection = serviceProvider.GetRequiredService<DbConnection>();
                options.UseSqlite(connection);
            });

            using var serviceProvider = services.BuildServiceProvider();
            using var scope = serviceProvider.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection.Dispose();
        }
    }
}