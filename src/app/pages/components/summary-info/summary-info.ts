import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-summary-info',
  imports: [AsyncPipe],
  templateUrl: './summary-info.html',
  styleUrl: './summary-info.css',
})
export class SummaryInfo implements OnInit {
  data$!: Observable<any>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getSummaryInfo();
  }
}
