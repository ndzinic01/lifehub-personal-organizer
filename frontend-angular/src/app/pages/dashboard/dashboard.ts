import {DatePipe} from '@angular/common';
import { ChangeDetectorRef ,Component, inject, OnInit } from '@angular/core';
import { RouterLink} from '@angular/router';
import {Task, TaskItem, TaskStatus} from '../../services/task';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly taskService = inject(Task);

  readonly TaskStatus = TaskStatus;
  private readonly cdr = inject(ChangeDetectorRef);

  tasks: TaskItem[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    this.taskService.getTasks().subscribe({
      next: (task) => {
        this.tasks = task;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage =
          'Nije moguće učitati zadatke. Provjeri je li backend pokrenut.';
        this.loading = false;
        this.cdr.markForCheck();
      },
      });
  }

  get inProgressCount(): number{
    return this.tasks.filter(
      (task) => task.status === TaskStatus.InProgress,).length;
  }

  get completedCount(): number {
    return this.tasks.filter(
      (task) => task.status === TaskStatus.Completed,
    ).length;
  }

  get overdueCount(): number {
    const now = new Date();

    return this.tasks.filter(
      (task) =>
        task.status !== TaskStatus.Completed &&
        task.dueDate !== null &&
        task.dueDate !== undefined &&
        new Date(task.dueDate) < now,
    ).length;
  }

  get completionPercentage(): number {
   if (this.tasks.length === 0) {
     return 0;
   }
   return Math.round((this.completedCount / this.tasks.length) * 100);
  }

  get todayTasks(): TaskItem[] {
    const today = new Date().toDateString();

    return this.tasks
      .filter(
        (task) => task.dueDate &&
          new Date(task.dueDate).toDateString() === today &&
          task.status !== TaskStatus.Completed,
      ).splice(0,4);
  }
}
