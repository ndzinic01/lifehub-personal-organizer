using System.ComponentModel.DataAnnotations;

namespace LifeHub.DTOs
{
    public class SetMonthlyBudgetDto
    {
        [Range(typeof(decimal), "0.01", "9999999999999999.99", ParseLimitsInInvariantCulture = true)]
        public decimal Amount { get; set; }
    }
}
