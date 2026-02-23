import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly registerForm = this.formBuilder.group(
    {
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  protected errorMessage = '';

  protected onSubmit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();
    const result = this.authService.register({
      fullName: formValue.fullName ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? ''
    });

    if (!result.success) {
      this.errorMessage = result.message ?? 'Registration failed. Please try again.';
      return;
    }

    this.router.navigate(['/login'], { queryParams: { registered: '1' } });
  }

  protected hasError(controlName: 'fullName' | 'email' | 'password' | 'confirmPassword'): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected get passwordStrength(): 'Weak' | 'Medium' | 'Strong' {
    const password = this.registerForm.get('password')?.value ?? '';
    if (password.length >= 12) {
      return 'Strong';
    }

    if (password.length >= 8) {
      return 'Medium';
    }

    return 'Weak';
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
