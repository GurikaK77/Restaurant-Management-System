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
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.proxyService.login({
      username: this.username,
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

        this.errorMessage = 'Login failed';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error || 'Login failed';
      }
    });
  }
}
