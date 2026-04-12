import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-total-customers',
  imports: [AsyncPipe],
  templateUrl: './total-customers.html',
  styleUrl: './total-customers.css',
})
export class TotalCustomers implements OnInit {
  data$!: Observable<number | null>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getTotalCustomers();
  }
}
