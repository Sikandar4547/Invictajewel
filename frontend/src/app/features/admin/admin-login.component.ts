import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
  ],
  template: `
    <div class="min-h-[60vh] bg-app-bg text-app-ink flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md rounded-2xl border border-app-border bg-app-card shadow-card p-8">
        <h1 class="font-display text-3xl mb-2 text-center">Admin sign in</h1><br />
        <form [formGroup]="form" (ngSubmit)="submit()" class="ij-login-form">
          <div class="ij-field">
            <label>Email</label>
            <input type="email" formControlName="email" autocomplete="username" [class.is-invalid]="isFieldInvalid('email')" />
            @if (errorFor('email'); as msg) { <small class="ij-error">{{ msg }}</small> }
          </div>
          <div class="ij-field">
            <label>Password</label>
            <input type="password" formControlName="password" autocomplete="current-password" [class.is-invalid]="isFieldInvalid('password')" />
            @if (errorFor('password'); as msg) { <small class="ij-error">{{ msg }}</small> }
          </div>
          <button type="submit" [disabled]="form.invalid || loading" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal">
            Sign in
          </button>
        </form>
        <a routerLink="/" class="block text-center text-sm text-app-accent mt-6 hover:underline">Back to store</a>
      </div>
    </div>
  `,
  styles: [`
    .ij-login-form { display: flex; flex-direction: column; gap: 16px; }
    .ij-field { display: flex; flex-direction: column; gap: 6px; }
    .ij-field label { font-size: 0.92rem; color: #374151; font-weight: 600; }
    .ij-field input { border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; padding: 10px 12px; width: 100%; }
    .ij-field .is-invalid { border-color: #dc2626; }
    .ij-error { color: #b91c1c; font-size: 0.8rem; }
    .ij-field input:focus { outline: none; border-color: #a8864c; box-shadow: 0 0 0 3px rgba(168,134,76,0.15); }
    .ij-login-form button { border-radius: 8px; padding: 10px 12px; font-weight: 600; width: 100%; cursor: pointer; }
    .ij-login-form button:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  loading = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isFieldInvalid(fieldName: 'email' | 'password'): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  errorFor(fieldName: 'email' | 'password'): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.invalid || !(field.touched || field.dirty)) return null;
    if (field.errors?.['required']) return `${fieldName === 'email' ? 'Email' : 'Password'} is required.`;
    if (field.errors?.['email']) return 'Please enter a valid email address.';
    return 'Invalid value.';
  }

  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const v = this.form.getRawValue();
    this.auth.login(v.email, v.password).subscribe({
      next: (res) => {
        this.auth.setTokens(res.token, res.refreshToken);
        this.loading = false;
        this.toast.success('Signed in', { duration: 2000 });
        this.router.navigateByUrl('/admin/dashboard');
      },
      error: () => {
        this.loading = false;
        this.toast.error('Invalid email or password', { duration: 4000 });
      },
    });
  }
}
