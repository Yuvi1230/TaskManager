import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../models/task.models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  protected tasks: Task[] = [];
  protected activeFilter: 'ALL' | TaskStatus = 'ALL';
  protected searchTerm = '';

  constructor() {
    this.loadTasks();
  }

  protected get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesStatus = this.activeFilter === 'ALL' ? true : task.status === this.activeFilter;
      const normalizedSearch = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }

  protected get todoCount(): number {
    return this.tasks.filter((task) => task.status === 'TODO').length;
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

    this.taskService.deleteTask(taskId);
    this.loadTasks();
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
      return 'bg-warning text-dark';
    }

    if (status === 'DONE') {
      return 'bg-success';
    }

    return 'bg-secondary';
  }

  private loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }
}
