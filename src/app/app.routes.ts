import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { ProfilePage } from './pages/profile/profile';
import { ReservationsPage } from './pages/reservations-page/reservations-page';
import { MenusPage } from './pages/menus-page/menus-page';
import { UsersPage } from './pages/users-page/users-page';
import { RestaurantsPage } from './pages/restaurants-page/restaurants-page';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: Home },
  { path: 'overview', redirectTo: 'main', pathMatch: 'full' },
  { path: 'reservations', component: ReservationsPage },
  { path: 'menus', component: MenusPage },
  { path: 'users', component: UsersPage },
  { path: 'restaurant', component: RestaurantsPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: ProfilePage },
  { path: '**', redirectTo: 'main' },
];
