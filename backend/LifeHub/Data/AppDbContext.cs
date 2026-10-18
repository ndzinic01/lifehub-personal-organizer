using LifeHub.Models;
using Microsoft.EntityFrameworkCore;
using TaskItem = LifeHub.Models.Task;

namespace LifeHub.Data
{
    public class AppDbContext (DbContextOptions<AppDbContext>options):DbContext(options)
    {
        public DbSet<TaskItem> Tasks { get; set; } = null!;
        public DbSet<ExpenseCategory> ExpenseCategories { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<MonthlyBudget> MonthlyBudgets { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Transaction>()
                .Property(transaction => transaction.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<MonthlyBudget>()
                .Property(budget => budget.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Transaction>()
                .HasOne(transaction => transaction.Category)
                .WithMany(category => category.Transactions)
                .HasForeignKey(transaction => transaction.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MonthlyBudget>()
                .HasIndex(budget => new
                {
                    budget.Year,
                    budget.Month
                }).IsUnique();
        }
        
    }
}
