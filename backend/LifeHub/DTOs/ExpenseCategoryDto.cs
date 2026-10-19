using LifeHub.Models;

namespace LifeHub.DTOs
{
    public class ExpenseCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TransactionType Type { get; set; }
    }
}
