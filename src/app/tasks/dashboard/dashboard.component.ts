import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../models/task.models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  protected tasks: Task[] = [];
  protected activeFilter: 'ALL' | TaskStatus = 'ALL';
  protected searchTerm = '';
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadTasks();
  }

  protected get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesStatus = this.activeFilter === 'ALL' ? true : task.status === this.activeFilter;
      const normalizedSearch = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        (task.description ?? '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }

  protected get todoCount(): number {
    return this.tasks.filter((task) => task.status === 'TODO').length;
  }

  protected get totalCount(): number {
    return this.tasks.length;
  }

  protected get inProgressCount(): number {
    return this.tasks.filter((task) => task.status === 'IN_PROGRESS').length;
  }

  protected get doneCount(): number {
    return this.tasks.filter((task) => task.status === 'DONE').length;
  }

  protected setFilter(filter: 'ALL' | TaskStatus): void {
    this.activeFilter = filter;
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchTerm = value;
  }

  protected onDelete(taskId: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(taskId).subscribe({
      next: () => this.loadTasks(),
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Failed to delete task.';
      }
    });
  }

  protected goToEdit(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  protected getStatusLabel(status: TaskStatus): string {
    if (status === 'IN_PROGRESS') {
      return 'In Progress';
    }

    if (status === 'DONE') {
      return 'Done';
    }

    return 'To-Do';
  }

  protected getStatusClass(status: TaskStatus): string {
    if (status === 'IN_PROGRESS') {
      return 'badge-progress';
    }

    if (status === 'DONE') {
      return 'badge-done';
    }

    return 'badge-todo';
  }

  protected getCardAccentClass(status: TaskStatus): string {
    if (status === 'IN_PROGRESS') {
      return 'task-card-progress';
    }

    if (status === 'DONE') {
      return 'task-card-done';
    }

    return 'task-card-todo';
  }

  private loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Failed to load tasks.';
      }
    });
  }
}
