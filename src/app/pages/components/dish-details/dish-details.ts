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
  dishes$!: Observable<any[]>;
  selectedDish: any | null = null;

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.dishes$ = this.proxyService.getPreviewDishes();
    this.dishes$.subscribe((dishes) => {
      if (!this.selectedDish && dishes.length) {
        this.selectedDish = dishes[0];
      }
    });
  }

  selectDish(dish: any) {
    this.selectedDish = dish;
  }
}
