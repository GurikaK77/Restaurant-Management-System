import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-reservation-status',
  imports: [AsyncPipe],
  templateUrl: './reservation-status.html',
  styleUrl: './reservation-status.css',
})
export class ReservationStatus implements OnInit {
  data$!: Observable<any[]>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getReservationStatusSummary();
  }
}
