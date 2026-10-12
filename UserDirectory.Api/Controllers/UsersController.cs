using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using UserDirectory.Api.Data;
using UserDirectory.Api.Models;

namespace UserDirectory.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .OrderBy(user => user.Name)
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            NormalizeUser(user);

            var validationResults = ValidateUser(user);

            if (validationResults.Count > 0)
            {
                foreach (var result in validationResults)
                {
                    var memberNames = result.MemberNames.Any()
                        ? result.MemberNames
                        : new[] { string.Empty };

                    foreach (var memberName in memberNames)
                    {
                        ModelState.AddModelError(memberName, result.ErrorMessage ?? "Invalid value.");
                    }
                }

                return ValidationProblem(ModelState);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                user);
        }

        // PUT: api/users/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
            {
                return NotFound();
            }

            NormalizeUser(updatedUser);

            var validationResults = ValidateUser(updatedUser);

            if (validationResults.Count > 0)
            {
                foreach (var result in validationResults)
                {
                    var memberNames = result.MemberNames.Any()
                        ? result.MemberNames
                        : new[] { string.Empty };

                    foreach (var memberName in memberNames)
                    {
                        ModelState.AddModelError(memberName, result.ErrorMessage ?? "Invalid value.");
                    }
                }

                return ValidationProblem(ModelState);
            }

            user.Name = updatedUser.Name;
            user.Age = updatedUser.Age;
            user.City = updatedUser.City;
            user.State = updatedUser.State;
            user.Pincode = updatedUser.Pincode;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/users/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static void NormalizeUser(User user)
        {
            user.Name = user.Name?.Trim() ?? string.Empty;
            user.City = user.City?.Trim() ?? string.Empty;
            user.State = user.State?.Trim() ?? string.Empty;
            user.Pincode = user.Pincode?.Trim() ?? string.Empty;
        }

        private static List<ValidationResult> ValidateUser(User user)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(user);

            Validator.TryValidateObject(
                user,
                validationContext,
                validationResults,
                validateAllProperties: true);

            return validationResults;
        }
    }
}
