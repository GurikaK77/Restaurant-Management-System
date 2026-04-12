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

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.proxyService.register({
      person: {
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        address: this.address
      },
      username: this.username,
      email: this.email,
      password: this.password,
      registrationDate: new Date().toISOString()
    }).subscribe({
      next: (result: any) => {
        this.loading = false;

        if (result?.status) {
          this.successMessage = result.message || 'Account created';
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage = result?.message || 'Registration failed';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.error || 'Registration failed';
      }
    });
  }
}
