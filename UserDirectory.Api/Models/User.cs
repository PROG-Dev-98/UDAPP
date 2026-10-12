using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace UserDirectory.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Name cannot contain only spaces.")]
        public string Name { get; set; } = string.Empty;

        [JsonRequired]
        [Range(0, 120)]
        public int Age { get; set; }

        [Required]
        [RegularExpression(@".*\S.*", ErrorMessage = "City cannot contain only spaces.")]
        public string City { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@".*\S.*", ErrorMessage = "State cannot contain only spaces.")]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(10, MinimumLength = 4)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Pincode cannot contain only spaces.")]
        public string Pincode { get; set; } = string.Empty;
    }
}
