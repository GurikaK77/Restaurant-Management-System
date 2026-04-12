import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, map } from 'rxjs';
import { ProxyService } from '../../services/proxy.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  profile$: Observable<any | null>;
  isLoggedIn$: Observable<boolean>;

  constructor(
    public proxyService: ProxyService,
    private router: Router
  ) {
    this.profile$ = this.proxyService.watchProfile();
    this.isLoggedIn$ = this.proxyService.authState$.pipe(map((token) => !!token));
  }

  logout() {
    this.proxyService.logout();
    this.router.navigate(['/login']);
  }
}
