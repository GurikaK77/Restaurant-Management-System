import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-available-dishes',
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './available-dishes.html',
  styleUrl: './available-dishes.css',
})
export class AvailableDishes implements OnInit {
  data$!: Observable<any[]>;

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getRestaurantCardsForShowcase();
  }
}
