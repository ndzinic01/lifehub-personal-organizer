using LifeHub.Data;
using LifeHub.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController (AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetCategories()
        {
            var categories = await _context.ExpenseCategories
                .AsNoTracking()
                .OrderBy(category => category.Type)
                .ThenBy(category => category.Name)
                .Select(category => new ExpenseCategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Type = category.Type,
                })
                .ToListAsync();
            return Ok(categories);
        }
    }
}
