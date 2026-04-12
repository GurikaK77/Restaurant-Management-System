import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-profile-editor',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './profile-editor.html',
  styleUrl: './profile-editor.css'
})
export class ProfileEditor implements OnInit {
  profile$!: Observable<any | null>;
  roles$!: Observable<any[]>;

  userId = 0;
  personId = 0;
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phone = '';
  address = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';
  savingAccount = false;
  savingPersonal = false;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.profile$ = this.proxyService.watchProfile();
    this.roles$ = this.proxyService.watchRoles();

    this.profile$.subscribe((profile) => {
      if (!profile) {
        return;
      }

      this.userId = profile.user?.id ?? 0;
      this.personId = profile.person?.id ?? 0;
      this.username = profile.user?.username ?? '';
      this.email = profile.user?.email ?? '';
      this.password = '';
      this.firstName = profile.person?.firstName ?? '';
      this.lastName = profile.person?.lastName ?? '';
      this.phone = profile.person?.phone ?? '';
      this.address = profile.person?.address ?? '';
    });
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  saveAccount() {
    if (!this.userId) {
      this.setMessage('error', 'Login first to update account details.');
      return;
    }

    this.savingAccount = true;
    this.setMessage('', '');

    this.proxyService.updateUserProfile(this.userId, {
      username: this.username,
      email: this.email,
      password: this.password || 'unchanged123'
    }).subscribe({
      next: (result: any) => {
        this.savingAccount = false;
        this.password = '';
        this.setMessage('success', result?.message || 'Account information updated.');
      },
      error: (err) => {
        this.savingAccount = false;
        this.setMessage('error', err?.error?.message || err?.error || 'Account update failed.');
      }
    });
  }

  savePersonal() {
    if (!this.userId) {
      this.setMessage('error', 'Login first to update personal info.');
      return;
    }

    this.savingPersonal = true;
    this.setMessage('', '');

    this.proxyService.updatePersonalInfo(this.personId || this.userId, {
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      address: this.address
    }).subscribe({
      next: (result: any) => {
        this.savingPersonal = false;
        this.setMessage('success', result?.message || 'Personal info updated.');
      },
      error: (err) => {
        this.savingPersonal = false;
        this.setMessage('error', err?.error?.message || err?.error || 'Personal info update failed.');
      }
    });
  }
}
