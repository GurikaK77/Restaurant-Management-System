import { Component } from '@angular/core';
import { RestaurantDetails } from '../components/restaurant-details/restaurant-details';
import { CapacitySeats } from '../components/capacity-seats/capacity-seats';

@Component({
  selector: 'app-restaurants-page',
  imports: [RestaurantDetails, CapacitySeats],
  templateUrl: './restaurants-page.html'
})
export class RestaurantsPage {}
