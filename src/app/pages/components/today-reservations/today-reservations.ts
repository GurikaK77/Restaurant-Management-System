import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-today-reservations',
  imports: [AsyncPipe],
  templateUrl: './today-reservations.html',
  styleUrl: './today-reservations.css',
})
export class TodayReservations implements OnInit {
  data$!: Observable<number | null>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getTodayReservationsCount();
  }
}
