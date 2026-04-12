import { AsyncPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  data$: Observable<any | null>;

  constructor(public proxyService: ProxyService) {
    this.data$ = this.proxyService.watchProfile();
  }

  onImageChange(event: Event, profile: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.proxyService.saveProfileImage(profile, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }
}
