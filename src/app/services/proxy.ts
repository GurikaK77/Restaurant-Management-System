import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxyService {
  apiUrl = 'https://localhost:7067/api';

  restaurantDishMap: Record<number, number[]> = {
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

  saveToken(token: string) {
    localStorage.setItem('restaurant_token', token);
  }

  getToken() {
    return localStorage.getItem('restaurant_token');
  }

  getAuthOptions() {
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
    return this.http.get<any[]>(`${this.apiUrl}/Restaurant/GetAll`);
  }

  getRestaurantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Restaurant/GetById/${id}`);
  }

  getMenus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Menu/GetAll`, this.getAuthOptions());
  }

  getDishById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Menu/GetDishById/${id}`, this.getAuthOptions());
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/User/GetProfile`, this.getAuthOptions());
  }

  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Admin/GetAllCustomers`, this.getAuthOptions());
  }

  getReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Reservation/GetAll`, this.getAuthOptions());
  }

  getMyReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Reservation/Get`, this.getAuthOptions());
  }

  getTotalRestaurants(): Observable<number> {
    return this.getRestaurants().pipe(
      map((result) => result.length)
    );
  }

  getTotalMenus(): Observable<number> {
    return this.getMenus().pipe(
      map((result) => result.length)
    );
  }

  getMenusByRestaurantId(restaurantId: number): Observable<any[]> {
    return this.getMenus().pipe(
      map((menus) => menus.filter((menu) => menu.restaurantId === restaurantId))
    );
  }

  getMenusWithRestaurantNames(): Observable<any[]> {
    return forkJoin({
      restaurants: this.getRestaurants(),
      menus: this.getMenus()
    }).pipe(
      map((result) =>
        result.menus.map((menu: any) => ({
          ...menu,
          restaurantName:
            result.restaurants.find((restaurant: any) => restaurant.id === menu.restaurantId)?.name || 'Unknown restaurant'
        }))
      )
    );
  }

  getRestaurantCard(restaurantId: number): Observable<any> {
    const dishIds = this.restaurantDishMap[restaurantId] || [];

    return forkJoin({
      restaurant: this.getRestaurantById(restaurantId),
      menus: this.getMenusByRestaurantId(restaurantId),
      dishes: dishIds.length
        ? forkJoin(dishIds.map((id) => this.getDishById(id)))
        : of([])
    });
  }

  getRestaurantCardsByIds(ids: number[]): Observable<any[]> {
    return forkJoin(ids.map((id) => this.getRestaurantCard(id)));
  }

  getSummaryInfo(): Observable<any> {
    return forkJoin({
      restaurants: this.getRestaurants(),
      menus: this.getMenus(),
      myReservations: this.getMyReservations()
    }).pipe(
      map((result) => ({
        totalRestaurants: result.restaurants.length,
        totalMenus: result.menus.length,
        myReservations: result.myReservations.length
      }))
    );
  }
}