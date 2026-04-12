import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-restaurant-details',
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.css',
})
export class RestaurantDetails implements OnInit {
  data$!: Observable<any>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.loadRestaurant(2);
  }

  loadRestaurant(id: number) {
    this.data$ = this.proxyService.getRestaurantDetailWithMenusAndDishes(id);
  }
}
