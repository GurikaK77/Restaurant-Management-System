import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-admin-users-manager',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './admin-users-manager.html',
  styleUrl: './admin-users-manager.css'
})
export class AdminUsersManager implements OnInit {
  isAdmin$!: Observable<boolean>;
  users: any[] = [];
  customers: any[] = [];
  roles: any[] = [];
  selectedUser: any | null = null;
  selectedUserRoles: any[] = [];

  selectedUserId = 0;
  username = '';
  email = '';
  password = '';
  roleIdToAssign = 0;
  roleIdToRemove = 0;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.isAdmin$ = this.proxyService.watchIsAdmin();
    this.loadAll();
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  loadAll() {
    this.proxyService.getAllUsers().subscribe((data) => this.users = data);
    this.proxyService.getCustomers().subscribe((data) => this.customers = data);
    this.proxyService.getAllRoles().subscribe((data) => {
      this.roles = data;
      if (data.length && !this.roleIdToAssign) {
        this.roleIdToAssign = data[0].id;
        this.roleIdToRemove = data[0].id;
      }
    });
  }

  selectUser(userId: number) {
    this.selectedUserId = userId;
    this.proxyService.getUserById(userId).subscribe((data) => {
      this.selectedUser = data;
      this.username = data?.user?.username || '';
      this.email = data?.user?.email || '';
      this.password = '';
    });
    this.proxyService.getRolesForUser(userId).subscribe((data) => this.selectedUserRoles = data);
  }

  updateUser() {
    if (!this.selectedUserId) {
      this.setMessage('error', 'Select a user first.');
      return;
    }

    this.proxyService.updateUserProfile(this.selectedUserId, {
      username: this.username,
      email: this.email,
      password: this.password || 'unchanged123'
    }).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'User updated.');
        this.loadAll();
        this.selectUser(this.selectedUserId);
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'User update failed.')
    });
  }

  assignRole() {
    if (!this.selectedUserId || !this.roleIdToAssign) {
      return;
    }

    this.proxyService.setUserRole(this.selectedUserId, Number(this.roleIdToAssign)).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'Role assigned.');
        this.selectUser(this.selectedUserId);
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Role assign failed.')
    });
  }

  removeRole() {
    if (!this.selectedUserId || !this.roleIdToRemove) {
      return;
    }

    this.proxyService.removeUserRole(this.selectedUserId, Number(this.roleIdToRemove)).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'Role removed.');
        this.selectUser(this.selectedUserId);
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Role remove failed.')
    });
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user?')) {
      return;
    }

    this.proxyService.deleteUserById(id).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'User deleted.');
        this.loadAll();
        if (this.selectedUserId === id) {
          this.selectedUser = null;
          this.selectedUserId = 0;
        }
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Delete user failed.')
    });
  }
}
