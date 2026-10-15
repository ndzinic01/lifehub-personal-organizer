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
  creating = false;
  errorMessage = '';

  newTask: CreateTaskDto = this.createEmptyTask();

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
        this.errorMessage =
          'Could not load tasks. Check that the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  createTask(form: NgForm): void {
    if (form.invalid || this.creating) {
      return;
    }

    this.creating = true;
    this.errorMessage = '';

    const taskToCreate: CreateTaskDto = {
      ...this.newTask,
      title: this.newTask.title.trim(),
      description: this.newTask.description?.trim() || null,
      dueDate: this.newTask.dueDate || null,
    };

    this.taskService.createTask(taskToCreate).subscribe({
      next: (createdTask) => {
        this.tasks = [createdTask, ...this.tasks];
        this.creating = false;
        this.newTask = this.createEmptyTask();
        form.resetForm(this.newTask);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Could not create the task. Please try again.';
        this.creating = false;
        this.cdr.markForCheck();
      },
    });
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
}




























