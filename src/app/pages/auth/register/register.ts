import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  firstName = '';
  lastName = '';
  username = '';
  email = '';
  phone = '';
  address = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private proxyService: ProxyService,
    private router: Router
  ) {}

  private resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private isBlank(value: string) {
    return !value.trim();
  }

  onSubmit() {
    if (this.loading) {
      return;
    }

    this.resetMessages();

    if (this.isBlank(this.firstName)) {
      this.errorMessage = 'First name is required';
      return;
    }

    if (this.isBlank(this.lastName)) {
      this.errorMessage = 'Last name is required';
      return;
    }

    if (this.isBlank(this.username)) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (this.isBlank(this.email)) {
      this.errorMessage = 'Email is required';
      return;
    }

    if (this.isBlank(this.phone)) {
      this.errorMessage = 'Phone number is required';
      return;
    }

    if (this.isBlank(this.address)) {
      this.errorMessage = 'Address is required';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    const payload = this.proxyService.normalizeRegisterPayload({
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      phone: this.phone,
      address: this.address,
      password: this.password,
    });

    this.proxyService.register(payload).subscribe({
      next: (result: any) => {
        this.loading = false;

        if (result?.status) {
          this.successMessage = result.message || 'Account created successfully';
          this.router.navigate(['/login'], {
            state: {
              registeredUsername: payload.username,
              registeredPassword: payload.password,
            }
          });
          return;
        }

        this.errorMessage = result?.message || 'Registration failed';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.proxyService.extractErrorMessage(err, 'Registration failed');
      }
    });
  }
}
