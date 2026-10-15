import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TaskPriority{
  Low = 0,
  Medium = 1,
  High = 2,
}

export enum TaskStatus{
  Pending =0,
  InProgress = 1,
  Completed = 2
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskDto{
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
}

@Injectable({
  providedIn: 'root',
})
export class Task {

  private readonly http = inject (HttpClient);

  private readonly apiUrl = 'https://localhost:7135/api/tasks';

  getTasks(): Observable<TaskItem[]>{
    return this.http.get<TaskItem[]>(this.apiUrl);
  }

  getTaskById(id: number):Observable<TaskItem>{
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<TaskItem>{
    return this.http.post<TaskItem>(this.apiUrl, task);
  }

  updateTask(id:number, task:CreateTaskDto): Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${id}`, {
      id,
      ...task
    });
  }

  deleteTask(id: number):Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}






















