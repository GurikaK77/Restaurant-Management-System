import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-admin-role-manager',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './admin-role-manager.html',
  styleUrl: './admin-role-manager.css'
})
export class AdminRoleManager implements OnInit {
  isAdmin$!: Observable<boolean>;
  roles: any[] = [];
  roleId = 0;
  roleName = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.isAdmin$ = this.proxyService.watchIsAdmin();
    this.loadRoles();
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  loadRoles() {
    this.proxyService.getAllRoles().subscribe((data) => this.roles = data);
  }

  fillForm(role: any) {
    this.roleId = role.id;
    this.roleName = role.name;
  }

  createRole() {
    this.proxyService.createRole({ name: this.roleName }).subscribe({
      next: () => {
        this.setMessage('success', 'Role created.');
        this.roleName = '';
        this.loadRoles();
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Role create failed.')
    });
  }

  updateRole() {
    if (!this.roleId) {
      this.setMessage('error', 'Choose a role first.');
      return;
    }

    this.proxyService.updateRole(this.roleId, { id: this.roleId, name: this.roleName }).subscribe({
      next: () => {
        this.setMessage('success', 'Role updated.');
        this.loadRoles();
      },
      error: (err) => this.setMessage('error', err?.error || 'Role update failed.')
    });
  }

  deleteRole(id: number) {
    if (!confirm('Delete this role?')) {
      return;
    }

    this.proxyService.deleteRole(id).subscribe({
      next: () => {
        this.setMessage('success', 'Role deleted.');
        this.loadRoles();
      },
      error: (err) => this.setMessage('error', err?.error || 'Role delete failed.')
    });
  }
}
