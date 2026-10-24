import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  CreateTaskDto,
  Task,
  TaskItem,
  TaskPriority,
  TaskStatus,
} from '../../services/task';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly taskService = inject(Task);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly TaskPriority = TaskPriority;
  readonly TaskStatus = TaskStatus;

  tasks: TaskItem[] = [];
  loading = true;
  saving = false;
  editingTaskId: number | null = null;
  deletingTaskId: number | null = null;
  errorMessage = '';
  filterStatus: TaskStatus | 'all' = 'all';
  filterPriority: TaskPriority | 'all' = 'all';

  newTask: CreateTaskDto = this.createEmptyTask();
  updatingTaskId: number | null = null;

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Could not load tasks. Check that the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
  saveTask(form: NgForm): void {
    if (form.invalid || this.saving) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const taskToSave: CreateTaskDto = {
      ...this.newTask,
      title: this.newTask.title.trim(),
      description: this.newTask.description?.trim() || null,
      dueDate: this.newTask.dueDate || null,
    };
    if (this.editingTaskId === null) {
      this.taskService.createTask(taskToSave).subscribe({
        next: (createTask) => {
          this.tasks = [createTask, ...this.tasks];
          this.saving = false;
          this.resetTaskForm(form);
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Nije moguće kreirati task. Molim Vas pokušajte ponovo.';
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
      return;
    }
    const taskId = this.editingTaskId;

    this.taskService.updateTask(taskId, taskToSave).subscribe({
      next: () => {
        this.tasks = this.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...taskToSave,
                description: taskToSave.description ?? null,
              }
            : task,
        );
        this.saving = false;
        this.resetTaskForm(form);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće izmijeniti task. Molim Vas pokušajte ponovo.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }
  editTask(task: TaskItem): void {
    this.editingTaskId = task.id;
    this.errorMessage = '';

    this.newTask = {
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate?.slice(0, 10) ?? null,
      priority: task.priority,
      status: task.status,
    };
  }

  cancelEdit(form: NgForm): void {
    this.resetTaskForm(form);
    this.errorMessage = '';
  }

  private resetTaskForm(form: NgForm): void {
    this.editingTaskId = null;
    this.newTask = this.createEmptyTask();
    form.resetForm(this.newTask);
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'Pending';
      case TaskStatus.InProgress:
        return 'In progress';
      case TaskStatus.Completed:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  getPriorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'Low';
      case TaskPriority.Medium:
        return 'Medium';
      case TaskPriority.High:
        return 'High';
      default:
        return 'Unknown';
    }
  }

  private createEmptyTask(): CreateTaskDto {
    return {
      title: '',
      description: '',
      dueDate: null,
      priority: TaskPriority.Medium,
      status: TaskStatus.Pending,
    };
  }

  deleteTask(task: TaskItem): void {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    this.deletingTaskId = task.id;
    this.errorMessage = '';

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((item) => item.id !== task.id);
        this.deletingTaskId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće izbrisati ovaj task. Molim Vas pokušajte opet.';
        this.deletingTaskId = null;
        this.cdr.markForCheck();
      },
    });
  }
  get filteredTasks(): TaskItem[] {
    return this.tasks.filter((task) => {
      const matchesStatus = this.filterStatus === 'all' || task.status === this.filterStatus;

      const matchesPriority =
        this.filterPriority === 'all' || task.priority === this.filterPriority;

      return matchesStatus && matchesPriority;
    });
  }
  toggleTaskCompletion(task: TaskItem): void {
    const newStatus = task.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed;

    const updatedTask: CreateTaskDto = {
      title: task.title,
      description: task.description ?? null,
      dueDate: task.dueDate ?? null,
      priority: task.priority,
      status: newStatus,
    };
    this.taskService.updateTask(task.id, updatedTask).subscribe({
      next: () => {
        this.tasks = this.tasks
          .map((item) => item.id === task.id
        ? { ...item, status: newStatus}
          : item,
        );
        this.updatingTaskId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće promijeniti status zadatka.';
        this.updatingTaskId = null;
        this.cdr.markForCheck();
      },
    });
  }
}




























