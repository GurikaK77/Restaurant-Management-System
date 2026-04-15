import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxyService {
  apiUrl = '/api';
  uploadsUrl = '/uploads';

  private readonly localDishStoreKey = 'local_menu_dishes';

  private authStateSubject = new BehaviorSubject<string | null>(this.getToken());
  authState$ = this.authStateSubject.asObservable();

  private reservationsRefreshSubject = new BehaviorSubject<number>(0);
  reservationsRefresh$ = this.reservationsRefreshSubject.asObservable();

  private profileRefreshSubject = new BehaviorSubject<number>(0);
  profileRefresh$ = this.profileRefreshSubject.asObservable();

  private rolesRefreshSubject = new BehaviorSubject<number>(0);
  rolesRefresh$ = this.rolesRefreshSubject.asObservable();

  private menuRefreshSubject = new BehaviorSubject<number>(Date.now());
  menuRefresh$ = this.menuRefreshSubject.asObservable();

  private localDishRefreshSubject = new BehaviorSubject<number>(Date.now());
  localDishRefresh$ = this.localDishRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(body: { username: string; password: string }): Observable<any> {
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
    this.refreshRoles();
    this.refreshMenus();
  }

  getToken() {
    return localStorage.getItem('restaurant_token');
  }

  logout() {
    localStorage.removeItem('restaurant_token');
    this.authStateSubject.next(null);
    this.refreshProfile();
    this.refreshReservations();
    this.refreshRoles();
    this.refreshMenus();
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

  refreshRoles() {
    this.rolesRefreshSubject.next(Date.now());
  }

  refreshMenus() {
    this.menuRefreshSubject.next(Date.now());
  }

  refreshLocalDishes() {
    this.localDishRefreshSubject.next(Date.now());
  }

  extractErrorMessage(error: unknown, fallback = 'Request failed'): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;

      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }

      if (payload && typeof payload === 'object') {
        const maybeMessage = (payload as { message?: unknown }).message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
          return maybeMessage;
        }

        const maybeTitle = (payload as { title?: unknown }).title;
        if (typeof maybeTitle === 'string' && maybeTitle.trim()) {
          return maybeTitle;
        }

        const maybeErrors = (payload as { errors?: Record<string, string[]> }).errors;
        if (maybeErrors && typeof maybeErrors === 'object') {
          const firstError = Object.values(maybeErrors).flat()[0];
          if (firstError) {
            return firstError;
          }
        }
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error && typeof error === 'object') {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
        return maybeMessage;
      }
    }

    return fallback;
  }

  normalizeRegisterPayload(body: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }) {
    return {
      person: {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        phone: body.phone.trim(),
        address: body.address.trim(),
      },
      username: body.username.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      registrationDate: new Date().toISOString(),
    };
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
      catchError(() => of([]))
    );
  }

  getRestaurantById(id: number): Observable<any | null> {
    return this.http.get<any>(`${this.apiUrl}/Restaurant/GetById/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  addRestaurant(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Restaurant/Add`, body, this.getAuthOptions());
  }

  updateRestaurant(id: number, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Restaurant/Update/${id}`, body, this.getAuthOptions());
  }

  deleteRestaurant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Restaurant/Remove/${id}`, this.getAuthOptions());
  }

  getMenus(): Observable<any[]> {
    return combineLatest([this.authState$, this.menuRefresh$]).pipe(
      switchMap(([token]) => {
        if (!token) {
          return of([]);
        }

        return this.http.get<any[]>(`${this.apiUrl}/Menu/GetAll`, this.getAuthOptions()).pipe(
          catchError(() => of([]))
        );
      }),
      shareReplay(1)
    );
  }

  createMenuWithImage(body: { restaurantId: number; name: string; image?: File | null }): Observable<any> {
    const form = new FormData();
    form.append('restaurantId', String(body.restaurantId));
    form.append('name', body.name);
    if (body.image) {
      form.append('image', body.image);
    }

    return this.http.post(`${this.apiUrl}/Menu/CreateMenuWithImage`, form, this.getAuthOptions()).pipe(
      tap(() => this.refreshMenus())
    );
  }

  updateMenu(id: number, body: { restaurantId: number; name: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/Menu/UpdateMenu/${id}`, body, this.getAuthOptions()).pipe(
      tap(() => this.refreshMenus())
    );
  }

  deleteMenu(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Menu/DeleteMenu/${id}`, this.getAuthOptions()).pipe(
      tap(() => {
        this.removeLocalDishesForMenu(id);
        this.refreshMenus();
      })
    );
  }

  addDishToMenu(menuId: number, body: { name: string; price: number; image?: File | null }): Observable<any> {
    const form = new FormData();
    form.append('name', body.name);
    form.append('price', String(body.price));
    if (body.image) {
      form.append('image', body.image);
    }

    return this.http.post(`${this.apiUrl}/Menu/AddDish/${menuId}`, form, this.getAuthOptions());
  }

  removeDish(dishId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Menu/RemoveDish/${dishId}`, this.getAuthOptions()).pipe(
      tap(() => this.removeLocalDish(dishId))
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

  getUserById(id: number): Observable<any | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/User/GetById/${id}`, this.getAuthOptions()).pipe(
      catchError(() => of(null))
    );
  }

  updateUserProfile(id: number, body: { username: string; email: string; password: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/UpdateProfile/${id}`, body, this.getAuthOptions()).pipe(
      tap(() => this.refreshProfile())
    );
  }

  updatePersonalInfo(id: number, body: { firstName: string; lastName: string; phone: string; address: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/UpdatePersonalInfo/${id}`, body, this.getAuthOptions()).pipe(
      tap(() => this.refreshProfile())
    );
  }

  deleteMyProfile(): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.delete(`${this.apiUrl}/User/DeleteProfile`, this.getAuthOptions());
  }

  deleteUserById(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/User/DeleteProfile/${id}`, this.getAuthOptions());
  }

  getUserRoles(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/User/GetRolesById`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  watchRoles(): Observable<any[]> {
    return combineLatest([this.authState$, this.rolesRefresh$]).pipe(
      switchMap(([token]) => token ? this.getUserRoles() : of([]))
    );
  }

  getRolesForUser(id: number): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/User/GetRoles/${id}`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  watchIsAdmin(): Observable<boolean> {
    return this.watchRoles().pipe(
      map((roles) => roles.some((role) => String(role.name).toLowerCase() === 'admin'))
    );
  }

  getAllUsers(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Admin/GetAllUsers`, this.getAuthOptions()).pipe(
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

  getAllRoles(): Observable<any[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Role/GetAllRoles`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  createRole(body: { name: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Role/CreateRoles`, body, this.getAuthOptions()).pipe(
      tap(() => this.refreshRoles())
    );
  }

  updateRole(id: number, body: { id: number; name: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/Role/UpdateRoles/${id}`, body, this.getAuthOptions()).pipe(
      tap(() => this.refreshRoles())
    );
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Role/DeleteRoles/${id}`, this.getAuthOptions()).pipe(
      tap(() => this.refreshRoles())
    );
  }

  setUserRole(userId: number, roleId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Admin/SetRole/${userId}/${roleId}`, {}, this.getAuthOptions()).pipe(
      tap(() => this.refreshRoles())
    );
  }

  removeUserRole(userId: number, roleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Admin/RemoveRole/${userId}/${roleId}`, this.getAuthOptions()).pipe(
      tap(() => this.refreshRoles())
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

  getReservationsByDate(date: string): Observable<any[]> {
    if (!this.isLoggedIn() || !date) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/Reservation/GetReservationsByDate/${date}`, this.getAuthOptions()).pipe(
      catchError(() => of([]))
    );
  }

  getReservationById(id: number): Observable<any | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/Reservation/GetById/${id}`, this.getAuthOptions()).pipe(
      catchError(() => of(null))
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
    }, this.getAuthOptions()).pipe(
      tap(() => this.refreshReservations())
    );
  }

  updateReservationStatus(id: number, statusId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/Reservation/UpdateStatus/${id}?statusId=${statusId}`, {}, this.getAuthOptions()).pipe(
      tap(() => this.refreshReservations())
    );
  }

  cancelReservation(id: number): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }

    return this.http.put(`${this.apiUrl}/Reservation/Cancel/${id}`, {}, this.getAuthOptions()).pipe(
      tap(() => this.refreshReservations())
    );
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Reservation/DeleteReservation/${id}`, this.getAuthOptions()).pipe(
      tap(() => this.refreshReservations())
    );
  }

  getTotalRestaurants(): Observable<number> {
    return this.getRestaurants().pipe(map((result) => result.length));
  }

  getTotalMenus(): Observable<number> {
    return this.getMenus().pipe(map((result) => result.length));
  }

  getTotalCustomers(): Observable<number> {
    return this.getCustomers().pipe(map((result) => result.length));
  }

  getTodayReservationsCount(): Observable<number> {
    const today = new Date().toISOString().split('T')[0];

    return this.getAllReservations().pipe(
      map((reservations) =>
        reservations.filter((reservation) =>
          String(reservation.date).startsWith(today)
        ).length
      )
    );
  }

  getMenusByRestaurantId(restaurantId: number): Observable<any[]> {
    return this.getMenus().pipe(
      map((menus) => menus.filter((menu) => menu.restaurantId === restaurantId))
    );
  }

  getMenusWithRestaurantNames(): Observable<any[]> {
    return combineLatest([this.getRestaurants(), this.getMenus(), this.watchLocalDishes()]).pipe(
      map(([restaurants, menus, localDishes]) =>
        menus.map((menu: any) => ({
          ...menu,
          restaurantName: restaurants.find((restaurant: any) => restaurant.id === menu.restaurantId)?.name || 'Unknown restaurant',
          localDishCount: localDishes.filter((dish: any) => Number(dish.menuId) === Number(menu.id)).length
        }))
      )
    );
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        result ? resolve(result) : reject('Image load failed');
      };
      reader.onerror = () => reject('Image load failed');
      reader.readAsDataURL(file);
    });
  }

  private getStoredLocalDishes(): any[] {
    try {
      const raw = localStorage.getItem(this.localDishStoreKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private setStoredLocalDishes(items: any[]) {
    localStorage.setItem(this.localDishStoreKey, JSON.stringify(items));
    this.refreshLocalDishes();
  }

  watchLocalDishes(): Observable<any[]> {
    return this.localDishRefresh$.pipe(map(() => this.getStoredLocalDishes()));
  }

  async rememberLocalDish(menuId: number, dish: { name: string; price: number; image?: File | null }): Promise<void> {
    const items = this.getStoredLocalDishes();
    const imageUrl = dish.image ? await this.readFileAsDataUrl(dish.image) : null;
    items.push({
      id: Date.now() + Math.floor(Math.random() * 10000),
      menuId: Number(menuId),
      name: dish.name,
      price: Number(dish.price),
      isAvaiable: true,
      imageUrl
    });
    this.setStoredLocalDishes(items);
  }

  removeLocalDish(dishId: number) {
    const next = this.getStoredLocalDishes().filter((item: any) => Number(item.id) !== Number(dishId));
    this.setStoredLocalDishes(next);
  }

  removeLocalDishesForMenu(menuId: number) {
    const next = this.getStoredLocalDishes().filter((item: any) => Number(item.menuId) !== Number(menuId));
    this.setStoredLocalDishes(next);
  }

  getStructuredMenuData(): Observable<any[]> {
    return combineLatest([this.getRestaurants(), this.getMenus(), this.watchLocalDishes()]).pipe(
      map(([restaurants, menus, localDishes]) => {
        return restaurants.map((restaurant: any) => {
          const restaurantMenus = menus
            .filter((menu: any) => Number(menu.restaurantId) === Number(restaurant.id))
            .map((menu: any) => ({
              ...menu,
              dishes: localDishes.filter((dish: any) => Number(dish.menuId) === Number(menu.id))
            }));

          return {
            ...restaurant,
            menus: restaurantMenus,
            dishes: restaurantMenus.flatMap((menu: any) => menu.dishes)
          };
        });
      })
    );
  }

  getRestaurantDetailWithMenusAndDishes(id: number): Observable<any> {
    return this.getStructuredMenuData().pipe(
      map((restaurants) => {
        const restaurant = restaurants.find((item: any) => Number(item.id) === Number(id));
        return restaurant || { restaurant: null, menus: [], dishes: [] };
      }),
      map((restaurant: any) => ({
        restaurant,
        menus: Array.isArray(restaurant?.menus) ? restaurant.menus : [],
        dishes: Array.isArray(restaurant?.dishes) ? restaurant.dishes : []
      }))
    );
  }

  getRestaurantCardsForShowcase(): Observable<any[]> {
    return this.getStructuredMenuData().pipe(
      map((restaurants) => restaurants.filter((restaurant: any) => restaurant.dishes.length > 0))
    );
  }

  getPreviewDishes(): Observable<any[]> {
    return this.watchLocalDishes().pipe(
      map((items) => items.slice(0, 3))
    );
  }

  getCapacityData(): Observable<any[]> {
    return this.getRestaurantTableSummary();
  }

  getRestaurantTableSummary(): Observable<any[]> {
    return this.getRestaurants().pipe(
      map((restaurants) =>
        restaurants.map((restaurant) => ({
          id: restaurant.id,
          name: restaurant.name,
          totalTables: restaurant.totalTables,
          seatsPerTable: restaurant.seatsPerTable,
          totalCapacity: Number(restaurant.totalTables || 0) * Number(restaurant.seatsPerTable || 0)
        }))
      )
    );
  }

  getUsersWithRoles(): Observable<any[]> {
    return combineLatest([this.getAllUsers(), this.getAllRoles()]).pipe(map(([users]) => users));
  }

  getCustomerSummaries(): Observable<any[]> {
    return combineLatest([this.getCustomers(), this.watchIsAdmin()]).pipe(map(([customers]) => customers));
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return 'assets/no-image.png';
    }

    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    return `${imageUrl}`;
  }

  getReservationStatusSummary(): Observable<any[]> {
    return this.watchMyReservations().pipe(
      map((reservations) => {
        const all = Array.isArray(reservations) ? reservations : [];
        const source = [
          { statusId: 1, label: 'Pending' },
          { statusId: 2, label: 'Confirmed' },
          { statusId: 3, label: 'Canceled' },
        ];

        return source.map((item) => ({
          ...item,
          count: all.filter((reservation: any) => Number(reservation.statusId) === item.statusId).length,
        }));
      })
    );
  }

  getSummaryInfo(): Observable<any> {
    return combineLatest([
      this.getRestaurants(),
      this.getMenus(),
      this.watchMyReservations(),
      this.watchProfile(),
      this.watchRoles()
    ]).pipe(
      map(([restaurants, menus, myReservations, profile, roles]) => ({
        totalRestaurants: restaurants.length,
        totalMenus: menus.length,
        myReservations: myReservations.length,
        displayName: this.getDisplayName(profile),
        username: profile?.user?.username || 'Guest',
        isAdmin: roles.some((role) => String(role.name).toLowerCase() === 'admin')
      }))
    );
  }

  saveProfileImage(_profile: any, imageDataUrl: string) {
    localStorage.setItem('profile_avatar', imageDataUrl);
    this.refreshProfile();
  }

  getStatusLabel(statusId: number): string {
    switch (Number(statusId)) {
      case 1:
        return 'Pending';
      case 2:
        return 'Confirmed';
      case 3:
        return 'Canceled';
      default:
        return `Status ${statusId}`;
    }
  }

  getStatusClass(statusId: number): string {
    switch (Number(statusId)) {
      case 1:
        return 'pending';
      case 2:
        return 'confirmed';
      case 3:
        return 'canceled';
      default:
        return 'unknown';
    }
  }

  formatDate(value?: string | null): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  getDisplayName(profile: any): string {
    const firstName = profile?.person?.firstName?.trim?.() || '';
    const lastName = profile?.person?.lastName?.trim?.() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return profile?.user?.username || 'Guest User';
  }

  getInitials(profile: any): string {
    const first = profile?.person?.firstName?.trim?.()?.charAt(0) || '';
    const last = profile?.person?.lastName?.trim?.()?.charAt(0) || '';
    const initials = `${first}${last}`.trim();

    if (initials) {
      return initials.toUpperCase();
    }

    const username = profile?.user?.username?.trim?.() || 'G';
    return username.charAt(0).toUpperCase();
  }

  getAvatarColor(profile: any): string {
    const name = this.getDisplayName(profile);
    const palette = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777'];
    let hash = 0;

    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return palette[Math.abs(hash) % palette.length];
  }

  saveLocalProfileAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';

        if (!result) {
          reject('Image load failed');
          return;
        }

        localStorage.setItem('profile_avatar', result);
        resolve(result);
      };

      reader.onerror = () => reject('Image load failed');
      reader.readAsDataURL(file);
    });
  }

  getStoredProfileAvatar(): string | null {
    return localStorage.getItem('profile_avatar');
  }

  removeStoredProfileAvatar() {
    localStorage.removeItem('profile_avatar');
  }

  getProfileAvatar(profile: any): string {
    const stored = this.getStoredProfileAvatar();
    if (stored) {
      return stored;
    }

    const initials = this.getInitials(profile);
    const color = encodeURIComponent(this.getAvatarColor(profile));
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <rect width="160" height="160" rx="80" fill="${color}" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="54" fill="white" font-weight="700">${initials}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
