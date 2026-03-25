import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SummaryInfo } from '../components/summary-info/summary-info';
import { TotalCustomers } from '../components/total-customers/total-customers';
import { TodayReservations } from '../components/today-reservations/today-reservations';
import { TotalMenus } from '../components/total-menus/total-menus';
import { TotalRestaurants } from '../components/total-restaurants/total-restaurants';
import { ReservationList } from '../components/reservation-list/reservation-list';
import { ReservationStatus } from '../components/reservation-status/reservation-status';
import { AllMenu } from '../components/all-menu/all-menu';
import { AvailableDishes } from '../components/available-dishes/available-dishes';
import { DishDetails } from '../components/dish-details/dish-details';
import { Customers } from '../components/customers/customers';
import { UserProfile } from '../components/user-profile/user-profile';
import { RestaurantDetails } from '../components/restaurant-details/restaurant-details';
import { CapacitySeats } from '../components/capacity-seats/capacity-seats';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    SummaryInfo,
    TotalCustomers,
    TodayReservations,
    TotalMenus,
    TotalRestaurants,
    ReservationList,
    ReservationStatus,
    AllMenu,
    AvailableDishes,
    DishDetails,
    Customers,
    UserProfile,
    RestaurantDetails,
    CapacitySeats,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
