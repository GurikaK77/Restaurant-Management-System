import { Component } from '@angular/core';
import { RestaurantDetails } from '../components/restaurant-details/restaurant-details';
import { CapacitySeats } from '../components/capacity-seats/capacity-seats';
import { AdminRestaurantManager } from '../components/admin-restaurant-manager/admin-restaurant-manager';

@Component({
  selector: 'app-restaurants-page',
  imports: [RestaurantDetails, CapacitySeats, AdminRestaurantManager],
  templateUrl: './restaurants-page.html'
})
export class RestaurantsPage {}
