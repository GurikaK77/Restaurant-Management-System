import { Component } from '@angular/core';
import { Customers } from '../components/customers/customers';
import { UserProfile } from '../components/user-profile/user-profile';

@Component({
  selector: 'app-users-page',
  imports: [Customers, UserProfile],
  templateUrl: './users-page.html'
})
export class UsersPage {}
