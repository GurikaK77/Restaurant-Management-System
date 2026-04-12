import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-total-restaurants',
  imports: [AsyncPipe],
  templateUrl: './total-restaurants.html',
  styleUrl: './total-restaurants.css',
})
export class TotalRestaurants implements OnInit {
  data$!: Observable<number>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getTotalRestaurants();
  }
}
