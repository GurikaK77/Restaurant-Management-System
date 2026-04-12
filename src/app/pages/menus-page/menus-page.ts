import { Component } from '@angular/core';
import { AllMenu } from '../components/all-menu/all-menu';
import { AvailableDishes } from '../components/available-dishes/available-dishes';
import { DishDetails } from '../components/dish-details/dish-details';
import { AdminMenuManager } from '../components/admin-menu-manager/admin-menu-manager';

@Component({
  selector: 'app-menus-page',
  imports: [AllMenu, AvailableDishes, DishDetails, AdminMenuManager],
  templateUrl: './menus-page.html'
})
export class MenusPage {}
