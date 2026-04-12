import { Component } from '@angular/core';
import { Customers } from '../components/customers/customers';
import { UserProfile } from '../components/user-profile/user-profile';
import { AdminUsersManager } from '../components/admin-users-manager/admin-users-manager';
import { AdminRoleManager } from '../components/admin-role-manager/admin-role-manager';

@Component({
  selector: 'app-users-page',
  imports: [Customers, UserProfile, AdminUsersManager, AdminRoleManager],
  templateUrl: './users-page.html'
})
export class UsersPage {}
