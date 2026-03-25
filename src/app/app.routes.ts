import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Signup } from './pages/authorization/signup/signup';
import { Login } from './pages/authorization/login/login';


export const routes: Routes = [
    {path: "", component: Home},
    {path: "main", component: Home},
    {path: "sign-up", component: Signup},
    {path: "sign-in", component: Login},
    
];
