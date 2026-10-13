using System.ComponentModel.DataAnnotations;

namespace LifeHub.DTOs
{
    public class UpdateTaskDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;
        [StringLength(1000)]
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }

        [EnumDataType(typeof(LifeHub.Models.TaskPriority))]
        public LifeHub.Models.TaskPriority Priority { get; set; } 
            = LifeHub.Models.TaskPriority.Medium;

        [EnumDataType(typeof(LifeHub.Models.TaskStatus))]
        public LifeHub.Models.TaskStatus Status { get; set; } 
            = LifeHub.Models.TaskStatus.Pending;
    }
}
