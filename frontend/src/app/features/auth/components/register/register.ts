import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './../../styles/auth.css',
})
export class Register implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly showPassword = signal(false);
  
  readonly registerForm = this.fb.nonNullable.group({

    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30)
    ]],

    email: ['', [
      Validators.required,
      Validators.email
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(30)
    ]],

    role: ['CLIENT', [
      Validators.required
    ]]
  });

  ngOnInit(): void {

    this.registerForm.reset({
      name: '',
      email: '',
      password: '',
      role: 'CLIENT'
    });

    this.isLoading.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  get name() {
    return this.registerForm.controls.name;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get role() {
    return this.registerForm.controls.role;
  }


  onSubmit(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    const name = this.registerForm.controls.name.value.trim();

    const email = this.registerForm.controls.email.value
      .trim()
      .toLowerCase();

    this.registerForm.patchValue({
      name,
      email
    });

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const request = this.registerForm.getRawValue();

    this.authService
      .register(request)
      .subscribe({

        next: (response) => {

          this.isLoading.set(false);

          this.successMessage.set(response.message);

          this.router.navigate(['/login']);
        },

        error: (error) => {

          this.isLoading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'Registration failed. Please try again.'
          );

        }

      });
  }
}