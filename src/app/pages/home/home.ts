import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SummaryInfo } from '../components/summary-info/summary-info';
import { TotalCustomers } from '../components/total-customers/total-customers';
import { TodayReservations } from '../components/today-reservations/today-reservations';
import { TotalMenus } from '../components/total-menus/total-menus';
import { TotalRestaurants } from '../components/total-restaurants/total-restaurants';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    SummaryInfo,
    TotalCustomers,
    TodayReservations,
    TotalMenus,
    TotalRestaurants,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
