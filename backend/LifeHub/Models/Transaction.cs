namespace LifeHub.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int CategoryId { get; set; }
        public ExpenseCategory Category { get; set; } = null!;
    }

    public enum TransactionType
    {
        Expense,
        Income
    }
}
