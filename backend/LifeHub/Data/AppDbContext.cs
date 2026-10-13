using LifeHub.Models;
using Microsoft.EntityFrameworkCore;

namespace LifeHub.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<LifeHub.Models.Task> Tasks => Set<LifeHub.Models.Task>();
    }
}
