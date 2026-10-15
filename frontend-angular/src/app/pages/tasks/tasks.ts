import { DatePipe } from '@angular/common';
import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {Task, TaskItem, TaskPriority, TaskStatus} from '../../services/task';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly taskService = inject(Task);
  private readonly cdr = inject(ChangeDetectorRef);

  tasks: TaskItem[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks(){
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () =>{
        this.errorMessage = 'Nije moguće učitati taskove.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

getStatusLabel(status: TaskStatus):string {
    switch (status) {
      case TaskStatus.Pending:
        return 'Pending';
      case TaskStatus.InProgress:
        return 'In progress';
        case TaskStatus.Completed:
          return 'Completed';
    }
  }

  getPriorityLabel(priority: TaskPriority):string{
    switch (priority) {
      case TaskPriority.Low:
        return 'Low';
        case TaskPriority.Medium:
          return 'Medium';
          case TaskPriority.High:
            return 'High';
    }
  }
}




























