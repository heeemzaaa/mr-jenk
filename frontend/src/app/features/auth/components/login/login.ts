import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './../../styles/auth.css',
})
export class Login implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);

  readonly showPassword = signal(false);
  
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loginForm.reset({
      email: '',
      password: ''
    });

    this.errorMessage.set('');
    this.isLoading.set(false);
  }

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]]
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }


  onSubmit(): void {

    this.errorMessage.set('');

    const email = this.loginForm.controls.email.value
      .trim()
      .toLowerCase();

    this.loginForm.controls.email.setValue(email);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const request = this.loginForm.getRawValue();

    this.authService
      .login(request)
      .subscribe({

        next: (response) => {

          this.authService.setUserFromToken(response.data);

          this.isLoading.set(false);

          this.router.navigate(['/']);
        },

        error: (error) => {

          this.isLoading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'Invalid email or password.'
          );
        }

      });
  }

}