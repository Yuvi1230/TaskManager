import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Task, TaskInput } from '../tasks/models/task.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tasksStorageKey = 'taskflow_tasks';

  getTasks(): Task[] {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      return [];
    }

    return this.getStoredTasks()
      .filter((task) => task.userEmail === userEmail)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }

  getTaskById(id: number): Task | null {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      return null;
    }

    const task = this.getStoredTasks().find((item) => item.id === id && item.userEmail === userEmail);
    return task ?? null;
  }

  createTask(input: TaskInput): Task | null {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      return null;
    }

    const now = new Date().toISOString();
    const tasks = this.getStoredTasks();
    const nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

    const task: Task = {
      id: nextId,
      title: input.title.trim(),
      description: input.description.trim(),
      dueDate: input.dueDate,
      status: input.status,
      userEmail,
      createdAt: now,
      updatedAt: now
    };

    tasks.push(task);
    this.persistTasks(tasks);
    return task;
  }

  updateTask(id: number, input: TaskInput): Task | null {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      return null;
    }

    const tasks = this.getStoredTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id && task.userEmail === userEmail);
    if (taskIndex === -1) {
      return null;
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      title: input.title.trim(),
      description: input.description.trim(),
      dueDate: input.dueDate,
      status: input.status,
      updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;
    this.persistTasks(tasks);
    return updatedTask;
  }

  deleteTask(id: number): boolean {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) {
      return false;
    }

    const tasks = this.getStoredTasks();
    const remainingTasks = tasks.filter((task) => !(task.id === id && task.userEmail === userEmail));
    if (remainingTasks.length === tasks.length) {
      return false;
    }

    this.persistTasks(remainingTasks);
    return true;
  }

  private getStoredTasks(): Task[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const rawTasks = localStorage.getItem(this.tasksStorageKey);
    if (!rawTasks) {
      return [];
    }

    try {
      return JSON.parse(rawTasks) as Task[];
    } catch {
      return [];
    }
  }

  private persistTasks(tasks: Task[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.tasksStorageKey, JSON.stringify(tasks));
  }
}
