import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-all-menu',
  imports: [AsyncPipe],
  templateUrl: './all-menu.html',
  styleUrl: './all-menu.css',
})
export class AllMenu implements OnInit {
  data$!: Observable<any[]>;

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getMenusWithRestaurantNames();
  }
}
