import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxyService {
  apiUrl = '/api';
  uploadsUrl = '/uploads';

  private authStateSubject = new BehaviorSubject<string | null>(this.getToken());
  authState$ = this.authStateSubject.asObservable();

  private reservationsRefreshSubject = new BehaviorSubject<number>(0);
  reservationsRefresh$ = this.reservationsRefreshSubject.asObservable();

  private profileRefreshSubject = new BehaviorSubject<number>(0);
  profileRefresh$ = this.profileRefreshSubject.asObservable();

  private restaurantDishMap: Record<number, number[]> = {
    1: [1, 2, 3, 4],
    2: [5, 6, 7, 8],
    3: [9, 10, 11, 12],
    4: [13, 14, 15, 16],
    5: [17, 18, 19, 20],
    6: [21, 22, 23, 24]
  };

  constructor(private http: HttpClient) {}

  login(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/Login`, body);
  }

  register(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/Register`, body);
  }

  saveToken(token: string) {
    localStorage.setItem('restaurant_token', token);
    this.authStateSubject.next(token);
    this.refreshProfile();
    this.refreshReservations();
  }

  getToken() {
    return localStorage.getItem('restaurant_token');
  }

  logout() {
    localStorage.removeItem('restaurant_token');
    this.authStateSubject.next(null);
    this.refreshProfile();
    this.refreshReservations();
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  refreshReservations() {
    this.reservationsRefreshSubject.next(Date.now());
  }

  refreshProfile() {
    this.profileRefreshSubject.next(Date.now());
  }

  private getAuthOptions() {
    const token = this.getToken();

    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getRestaurants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Restaurant/GetAll`).pipe(
      shareReplay(1)
    );
  }

  getRestaurantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Restaurant/GetById/${id}`);
  }

  getMenus(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Menu/GetAll`, this.getAuthOptions()).pipe(
      catchError(() => of([])),
      shareReplay(1)
    );
  }

  getDishById(id: number): Observable<any | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/Menu/GetDishById/${id}`, this.getAuthOptions()).pipe(
      catchError(() => of(null))
    );
  }

  getProfile(): Observable<any | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/User/GetProfile`, this.getAuthOptions()).pipe(
      catchError(() => of(null))
    );
  }

  watchProfile(): Observable<any | null> {
    return combineLatest([this.authState$, this.profileRefresh$]).pipe(
      switchMap(([token]) => token ? this.getProfile() : of(null))
    );
  }

  getUserRoles(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/User/GetRolesById`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  getCustomers(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Admin/GetAllCustomers`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  getAllReservations(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Reservation/GetAll`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  getMyReservations(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Reservation/Get`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  watchMyReservations(): Observable<any[]> {
    return combineLatest([this.authState$, this.reservationsRefresh$]).pipe(
      switchMap(([token]) => token ? this.getMyReservations() : of([]))
    );
  }

  createReservation(body: {
    restaurantId: number;
    date: string;
    tableNumber: number;
    guestCount: number;
    statusId?: number;
  }): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.post(`${this.apiUrl}/Reservation/Add`, {
      customerId: 0,
      restaurantId: body.restaurantId,
      statusId: body.statusId ?? 1,
      date: body.date,
      tableNumber: body.tableNumber,
      guestCount: body.guestCount
    }, this.getAuthOptions());
  }

  cancelReservation(id: number): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.put(`${this.apiUrl}/Reservation/Cancel/${id}`, {}, this.getAuthOptions());
  }

  deleteMyProfile(): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.delete(`${this.apiUrl}/User/DeleteProfile`, this.getAuthOptions());
  }

  getTotalRestaurants(): Observable<number> {
    return this.getRestaurants().pipe(
      map((result) => result.length)
    );
  }

  getTotalMenus(): Observable<number | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.getMenus().pipe(
      map((result) => result.length)
    );
  }

  getTotalCustomers(): Observable<number | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return combineLatest([this.getCustomers(), this.getUserRoles()]).pipe(
      map(([customers, roles]) => roles.some((role) => role.name === 'Admin') ? customers.length : null),
      catchError(() => of(null))
    );
  }

  getTodayReservationsCount(): Observable<number | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    const today = new Date().toISOString().slice(0, 10);

    return this.watchMyReservations().pipe(
      map((reservations) => reservations.filter((item) => String(item.date).slice(0, 10) === today).length)
    );
  }

  getMenusByRestaurantId(restaurantId: number): Observable<any[]> {
    return this.getMenus().pipe(
      map((menus) => menus.filter((menu) => menu.restaurantId === restaurantId))
    );
  }

  getMenusWithRestaurantNames(): Observable<any[]> {
    return combineLatest([this.getRestaurants(), this.getMenus()]).pipe(
      map(([restaurants, menus]) =>
        menus.map((menu: any) => ({
          ...menu,
          restaurantName: restaurants.find((restaurant: any) => restaurant.id === menu.restaurantId)?.name || 'Unknown restaurant'
        }))
      )
    );
  }

  getAvailableRestaurantCards(ids: number[]): Observable<any[]> {
    return forkJoin(ids.map((id) => this.getRestaurantCard(id)));
  }

  getRestaurantCard(restaurantId: number): Observable<any> {
    const dishIds = this.restaurantDishMap[restaurantId] || [];

    return forkJoin({
      restaurant: this.getRestaurantById(restaurantId),
      menus: this.getMenusByRestaurantId(restaurantId),
      dishes: dishIds.length
        ? forkJoin(dishIds.map((id) => this.getDishById(id))).pipe(
            map((dishes) => dishes.filter((dish) => !!dish))
          )
        : of([])
    });
  }

  getDishGroup(ids: number[]): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return forkJoin(ids.map((id) => this.getDishById(id))).pipe(
      map((items) => items.filter((item) => !!item))
    );
  }

  getSummaryInfo(): Observable<any> {
    return combineLatest([
      this.getRestaurants(),
      this.getTotalMenus(),
      this.watchMyReservations()
    ]).pipe(
      map(([restaurants, totalMenus, myReservations]) => ({
        totalRestaurants: restaurants.length,
        totalMenus,
        myReservations: myReservations.length,
        loggedIn: this.isLoggedIn()
      }))
    );
  }

  getCapacityData(): Observable<any[]> {
    return this.getRestaurants().pipe(
      map((restaurants) => restaurants.map((restaurant) => ({
        ...restaurant,
        capacity: restaurant.totalTables * restaurant.seatsPerTable
      })))
    );
  }

  getReservationStatusSummary(): Observable<any[]> {
    return this.watchMyReservations().pipe(
      map((reservations) => {
        const source = [
          { label: 'Pending', statusId: 1 },
          { label: 'Confirmed', statusId: 2 },
          { label: 'Canceled', statusId: 3 }
        ];

        return source.map((item) => ({
          label: item.label,
          count: reservations.filter((reservation) => reservation.statusId === item.statusId).length
        }));
      })
    );
  }

  getRestaurantDetailWithMenusAndDishes(restaurantId: number): Observable<any> {
    return this.getRestaurantCard(restaurantId);
  }

  getRestaurantCardsForShowcase(): Observable<any[]> {
    return this.getAvailableRestaurantCards([2, 3]);
  }

  getDishDetailsDefault(): Observable<any | null> {
    return this.getDishById(5);
  }

  getDisplayName(profile: any): string {
    if (!profile) {
      return 'Guest User';
    }

    const fullName = `${profile.person?.firstName || ''} ${profile.person?.lastName || ''}`.trim();
    return fullName || profile.user?.username || 'Guest User';
  }

  getProfileStorageKey(profile: any): string {
    return `profile_image_${profile?.user?.id || 'guest'}`;
  }

  saveProfileImage(profile: any, imageDataUrl: string) {
    localStorage.setItem(this.getProfileStorageKey(profile), imageDataUrl);
    this.refreshProfile();
  }

  getSavedProfileImage(profile: any): string | null {
    return localStorage.getItem(this.getProfileStorageKey(profile));
  }

  getInitials(profile: any): string {
    const name = this.getDisplayName(profile);
    const parts = name.split(' ').filter(Boolean).slice(0, 2);

    if (!parts.length) {
      return 'GU';
    }

    return parts.map((item) => item[0]?.toUpperCase() || '').join('');
  }

  getGeneratedAvatar(profile: any): string {
    const initials = this.getInitials(profile);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="avatarGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#f97316" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="28" fill="url(#avatarGradient)" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="42" font-family="Arial, sans-serif" font-weight="700" fill="#111827">${initials}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  getProfileAvatar(profile: any): string {
    const savedImage = this.getSavedProfileImage(profile);
    return savedImage || this.getGeneratedAvatar(profile);
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return this.getGeneratedFoodPlaceholder();
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads')) {
      return imageUrl;
    }

    return `${this.uploadsUrl}/${imageUrl.replace(/^\/+/, '')}`;
  }

  private getGeneratedFoodPlaceholder(): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#fb7185" />
          </linearGradient>
        </defs>
        <rect width="320" height="220" rx="28" fill="#111827" />
        <rect x="14" y="14" width="292" height="192" rx="22" fill="url(#g)" opacity="0.16" />
        <circle cx="160" cy="108" r="52" fill="none" stroke="#fde68a" stroke-width="12" />
        <path d="M124 96c18-30 54-30 72 0" fill="none" stroke="#fde68a" stroke-width="10" stroke-linecap="round" />
        <circle cx="140" cy="116" r="7" fill="#fde68a" />
        <circle cx="180" cy="116" r="7" fill="#fde68a" />
        <text x="50%" y="182" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" font-weight="700" fill="#f8fafc">Menu image</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}

