import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-dish-details',
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './dish-details.html',
  styleUrl: './dish-details.css',
})
export class DishDetails implements OnInit {
  data$!: Observable<any | null>;

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.loadDish(5);
  }

  loadDish(id: number) {
    this.data$ = this.proxyService.getDishById(id);
  }
}
