using LifeHub.Data;
using LifeHub.Models;
using LifeHub.DTOs;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskItem = LifeHub.Models.Task;

namespace LifeHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TasksController(AppDbContext context) {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            var tasks = await _context.Tasks
                .AsNoTracking()
                .OrderBy(t => t.DueDate)
                .ThenBy(t => t.Id)
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task is null)
            {
                return NotFound(new { message = "Task not found." });
            }

            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask([FromBody] CreateTaskDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new
                {
                    message = "Title cannot be empty or whitespace."
                });
            }

            var task = new TaskItem
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                DueDate = dto.DueDate,
                Priority = dto.Priority,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetTask),
                    new { Id = task.Id },
                    task);

        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTask(
            int id, [FromBody] UpdateTaskDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new
                {
                    message = "Title cannot be empty or whitespace. "
                });
            }
            var task = await _context.Tasks.FindAsync(id);
            if (task is null)
            {
                return NotFound(new { message = "Task not found." });
            }
            task.Title = dto.Title.Trim();
            task.Description = dto.Description?.Trim();
            task.DueDate = dto.DueDate;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
            

            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task is null)
            {
                return NotFound(new
                {
                    message = "Task not found."
                });
            }
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
