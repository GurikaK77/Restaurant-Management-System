import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { ProxyService } from '../../services/proxy.service';
import { UserProfile } from '../components/user-profile/user-profile';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, UserProfile, AsyncPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage {
  profile$: Observable<any | null>;
  canDeleteProfile$: Observable<boolean>;
  deleting = false;
  message = '';
  messageType: 'error' | 'success' | '' = '';

  constructor(
    private proxyService: ProxyService,
    private router: Router
  ) {
    this.profile$ = this.proxyService.watchProfile();
    this.canDeleteProfile$ = this.proxyService.getUserRoles().pipe(
      map((roles) => roles.some((role) => role.name === 'Customer'))
    );
  }

  deleteProfile() {
    const confirmed = window.confirm('Are you sure you want to delete your profile?');

    if (!confirmed) {
      return;
    }

    this.deleting = true;
    this.message = '';
    this.messageType = '';

    this.proxyService.deleteMyProfile().subscribe({
      next: (result: any) => {
        this.deleting = false;
        this.message = result?.message || 'Profile deleted successfully.';
        this.messageType = 'success';
        this.proxyService.logout();
        this.router.navigate(['/register']);
      },
      error: (err) => {
        this.deleting = false;
        this.message = err?.error?.message || err?.error || 'Profile could not be deleted.';
        this.messageType = 'error';
      }
    });
  }
}
