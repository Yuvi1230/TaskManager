import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.constants';
import { Task, TaskInput } from '../tasks/models/task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE_URL}/api/tasks`);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${API_BASE_URL}/api/tasks/${id}`);
  }

  createTask(input: TaskInput): Observable<Task> {
    return this.http.post<Task>(`${API_BASE_URL}/api/tasks`, input);
  }

  updateTask(id: number, input: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${API_BASE_URL}/api/tasks/${id}`, input);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/tasks/${id}`);
  }
}
