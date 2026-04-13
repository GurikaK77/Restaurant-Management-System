import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private proxyService: ProxyService,
    private router: Router
  ) {
    const navigationState = history.state as { registeredUsername?: string; registeredPassword?: string };

    if (navigationState?.registeredUsername) {
      this.username = navigationState.registeredUsername;
    }

    if (navigationState?.registeredPassword) {
      this.password = navigationState.registeredPassword;
      this.successMessage = 'Registration succeeded. You can sign in now.';
    }
  }

  onSubmit() {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.successMessage = '';
    this.loading = true;

    this.proxyService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (result: any) => {
        this.loading = false;

        if (result?.status && result?.message) {
          this.proxyService.saveToken(result.message);
          this.successMessage = 'Login successful';
          this.router.navigate(['/main']);
          return;
        }

        this.errorMessage = result?.message || 'Login failed';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.proxyService.extractErrorMessage(err, 'Login failed');
      }
    });
  }
}
