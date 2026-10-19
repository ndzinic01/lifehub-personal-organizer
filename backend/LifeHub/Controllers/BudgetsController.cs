using LifeHub.Data;
using LifeHub.DTOs;
using LifeHub.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BudgetsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BudgetsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{year:int}/{month:int}")]
        public async Task<ActionResult<MonthlyBudgetDto>> GetMonthlyBudget (int year, int month)
        {
            if (month <1 ||  month > 12)
            {
                return BadRequest(new
                {
                    message = "Mjesec mora biti između 1 i 12."
                });
            }
            var budget = await _context.MonthlyBudgets
                .AsNoTracking()
                .FirstOrDefaultAsync( item => item.Year == year && item.Month == month);
            return Ok(new MonthlyBudgetDto
            {
                Year = year,
                Month = month,
                Amount = budget?.Amount ?? 0
            });
        }

        [HttpPut("{year:int}/{month:int}")]
        public async Task<ActionResult<MonthlyBudgetDto>> SetMonthlyBudget (int year, int month, [FromBody] SetMonthlyBudgetDto dto)
        {
            if(month < 1 || month > 12)
            {
                return BadRequest(new
                {
                    message = "Mjesec mora biti između 1 i 12."
                });
            }
            var budget = await _context.MonthlyBudgets
                .FirstOrDefaultAsync(item => item.Year == year && item.Month == month);
            if (budget is null)
            {
                budget = new MonthlyBudget
                {
                    Year = year,
                    Month = month,
                };
                _context .MonthlyBudgets.Add(budget);
            }
            budget.Amount = dto.Amount;
            await _context.SaveChangesAsync();
            return Ok(new MonthlyBudgetDto
            {
                Year = year,
                Month = month,
                Amount = budget.Amount
            });
        }
    }
}
