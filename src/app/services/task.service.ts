import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskItem } from '../models/task-item.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7052/api/tasks';

  getAllTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.baseUrl);
  }

  getTaskById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.baseUrl}/${id}`);
  }

  createTask(task: TaskItem): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.baseUrl, task);
  }

  updateTask(id: number, task: TaskItem): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
