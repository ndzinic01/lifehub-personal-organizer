using LifeHub.Data;
using LifeHub.DTOs;
using LifeHub.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace LifeHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactions()
        {
            var transactions = await _context.Transactions
                .AsNoTracking()
                .OrderByDescending(transaction => transaction.Date)
                .Select(transaction => new 
                TransactionResponseDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Type = transaction.Type,
                    Description = transaction.Description,
                    Date = transaction.Date,
                    CategoryId = transaction.CategoryId,
                    CategoryName = transaction.Category.Name
                }).ToListAsync();
            return Ok(transactions);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<TransactionResponseDto>> GetTransaction(int id)
        {
            var transaction = await _context.Transactions.AsNoTracking()
                .Where(transaction => transaction.Id == id)
                .Select(transaction => new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Type = transaction.Type,
                    Description = transaction.Description,
                    Date = transaction.Date,
                    CategoryId = transaction.CategoryId,
                    CategoryName = transaction.Category.Name,
                }).FirstOrDefaultAsync();

            if(transaction is null)
            {
                return NotFound(new
                {
                    message = "Transakcija nije pronađena. "
                });
            }

            return Ok(transaction);
            
        }

        [HttpPost]
        public async Task<ActionResult<TransactionResponseDto>> CreateTransaction([FromBody] CreateTransactionDto dto )
        {
            var category = await _context.ExpenseCategories.FindAsync(dto.CategoryId);

            if(category is null)
            {
                return BadRequest(new
                {
                    message = "Kategorija nije pronađena."
                });
            }

            if(category.Type != dto.Type)
            {
                return BadRequest(new
                {
                    message = "Transakcijski tip mora biti isti kao tip kategorije."
                });
            }

            var transaction = new Transaction
            {
                Amount = dto.Amount,
                Type = dto.Type,
                Description = dto.Description?.Trim(),
                Date = dto.Date,
                CategoryId = dto.CategoryId
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            var response = new TransactionResponseDto
            {
                Id = transaction.Id,
                Amount = transaction.Amount,
                Type = transaction.Type,
                Description = transaction.Description,
                Date = transaction.Date,
                CategoryId = category.Id,
                CategoryName = category.Name
            };
            return CreatedAtAction(
                nameof(GetTransaction),
                new {id = transaction.Id},
                response);
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if( transaction is null)
            {
                return NotFound(new
                {
                    message = "Transakcija nije pronađena."
                });
            }
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
                
    }
    
}
