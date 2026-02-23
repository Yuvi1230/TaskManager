import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected errorMessage = '';
  protected successMessage = '';

  constructor() {
    const registeredParam = this.activatedRoute.snapshot.queryParamMap.get('registered');
    if (registeredParam === '1') {
      this.successMessage = 'Registration successful. Please log in.';
    }
  }

  protected onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.getRawValue();
    const result = this.authService.login(formValue.email ?? '', formValue.password ?? '');

    if (!result.success) {
      this.errorMessage = result.message ?? 'Login failed. Please try again.';
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  protected hasError(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
