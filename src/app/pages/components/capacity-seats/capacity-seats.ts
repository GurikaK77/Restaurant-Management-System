import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-capacity-seats',
  imports: [AsyncPipe],
  templateUrl: './capacity-seats.html',
  styleUrl: './capacity-seats.css',
})
export class CapacitySeats implements OnInit {
  data$!: Observable<any[]>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getCapacityData();
  }
}
