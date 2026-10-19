using LifeHub.Models;
using System.ComponentModel.DataAnnotations;

namespace LifeHub.DTOs
{
    public class UpdateTransactionDto
    {
        [Range(typeof(decimal), "0.01", "9999999999999999.99")]
        public decimal Amount { get; set; }
        [EnumDataType(typeof(TransactionType))]
        public TransactionType Type { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        public DateTime Date {  get; set; } = DateTime.UtcNow;
        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }
    }
}
