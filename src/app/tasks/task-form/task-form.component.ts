import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskStatus } from '../models/task.models';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly taskForm = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: [''],
    dueDate: ['', [Validators.required]],
    status: ['TODO' as TaskStatus, [Validators.required]]
  });

  protected readonly statusOptions: { label: string; value: TaskStatus }[] = [
    { label: 'To-Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' }
  ];

  protected isEditMode = false;
  protected taskId: number | null = null;
  protected errorMessage = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.isEditMode = true;
    this.taskId = Number(idParam);

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status
        });
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Task not found or you do not have access to it.';
      }
    });
  }

  protected onSubmit(): void {
    this.errorMessage = '';

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = this.taskForm.getRawValue();
    const requestBody = {
      title: payload.title ?? '',
      description: payload.description ?? '',
      dueDate: payload.dueDate ?? '',
      status: (payload.status as TaskStatus) ?? 'TODO'
    };

    if (!this.isEditMode) {
      this.taskService.createTask(requestBody).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Unable to create task. Please try again.';
        }
      });

      return;
    }

    if (!this.taskId) {
      this.errorMessage = 'Task ID is invalid.';
      return;
    }

    this.taskService.updateTask(this.taskId, requestBody).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to update task. Please try again.';
      }
    });
  }

  protected onDelete(): void {
    if (!this.taskId) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(this.taskId).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to delete task.';
      }
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  protected hasError(controlName: 'title' | 'dueDate'): boolean {
    const control = this.taskForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected get displayTaskId(): string {
    if (!this.taskId) {
      return 'N/A';
    }

    return `TK-${String(this.taskId).padStart(3, '0')}`;
  }

  protected get selectedStatusLabel(): string {
    const status = (this.taskForm.get('status')?.value as TaskStatus | null) ?? 'TODO';

    if (status === 'IN_PROGRESS') {
      return 'In Progress';
    }

    if (status === 'DONE') {
      return 'Done';
    }

    return 'To-Do';
  }

  protected get selectedStatusBadgeClass(): string {
    const status = (this.taskForm.get('status')?.value as TaskStatus | null) ?? 'TODO';

    if (status === 'IN_PROGRESS') {
      return 'status-chip status-progress';
    }

    if (status === 'DONE') {
      return 'status-chip status-done';
    }

    return 'status-chip status-todo';
  }
}
