import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppError, AppErrorType, utils } from '@org/shared';
import { Button } from '@org/ui';
import { UserService } from '../../service/user.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

interface Particle {
  top: number;
  left: number;
  size: number;
}

@Component({
  selector: 'app-authenticate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button],
  templateUrl: './authenticate.html',
  styleUrl: './authenticate.scss',
})
export class Authenticate implements OnInit {

  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected readonly isRegister = signal(false);
  protected readonly submitted = signal(false);
  protected readonly onResponse = signal(false);
  protected readonly responseError = signal<AppError | null>(null);
  protected readonly loading = signal(false);
  protected readonly particles = signal<Particle[]>([]);
  protected readonly loginForm: FormGroup;
  protected readonly registerForm: FormGroup;
  protected readonly responseUnauthorized = computed(
    () => this.onResponse() && this.responseError()?.errorType === AppErrorType.UNAUTHORIZED,
  );
  protected readonly responseConflict = computed(
    () => this.onResponse() && this.responseError()?.errorType === AppErrorType.CONFLICT,
  );
  protected readonly responseInternal = computed(
    () => this.onResponse() && this.responseError()?.errorType === AppErrorType.INTERNAL,
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────────────
  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.particles.set(
      Array.from({ length: 80 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 4 + 2,
      })),
    );
  }

  // ── Methods ──────────────────────────────────────────────────────────────────────
  protected switchMode(): void {
    this.submitted.set(false);
    this.onResponse.set(false);
    this.responseError.set(null);
    this.isRegister.update((v) => !v);
  }

  protected async onLogin(): Promise<void> {
    this.loading.set(true);
    await utils.wait(1000);

    this.submitted.set(true);
    this.onResponse.set(false);
    this.responseError.set(null);

    if (this.loginForm.invalid) {
      this.loading.set(false);
      return;
    }

    this.submitted.set(false);

    const { username, password } = this.loginForm.value;

    try {
      await this.userService.login({ name: username, password });
      this.onAuthSuccess();
    } catch (err: unknown) {
      this.responseError.set(err as AppError);
      this.loading.set(false);
    } finally {
      this.onResponse.set(true);
    }
  }

  protected async onRegister(): Promise<void> {
    this.loading.set(true);
    await utils.wait(1000);

    this.submitted.set(true);
    this.onResponse.set(false);
    this.responseError.set(null);

    if (this.registerForm.invalid) {
      this.loading.set(false);
      return;
    }

    this.submitted.set(false);

    const { username, password } = this.registerForm.value;

    await utils.wait(1000);
    try {
      await this.userService.register({ name: username, password });
      this.onAuthSuccess();
    } catch (err: unknown) {
      this.responseError.set(err as AppError);
      this.loading.set(false);
    } finally {
      this.onResponse.set(true);
    }
  }

  protected hasError(form: FormGroup, field: string, error: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && (ctrl.dirty || ctrl.touched || this.submitted()) && ctrl.hasError(error));
  }

  protected hasPasswordMismatch(): boolean {
    return !!(
      (this.registerForm.dirty || this.submitted()) &&
      this.registerForm.hasError('passwordMismatch')
    );
  }

  private onAuthSuccess(): void {
    this.router.navigate(['/']);
  }
}
