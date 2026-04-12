import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-total-menus',
  imports: [AsyncPipe],
  templateUrl: './total-menus.html',
  styleUrl: './total-menus.css',
})
export class TotalMenus implements OnInit {
  data$!: Observable<number | null>;

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.getTotalMenus();
  }
}
