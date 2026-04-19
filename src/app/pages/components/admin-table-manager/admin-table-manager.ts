import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-admin-table-manager',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './admin-table-manager.html',
  styleUrl: './admin-table-manager.css'
})
export class AdminTableManager implements OnInit {
  isAdmin$!: Observable<boolean>;
  restaurants$!: Observable<any[]>;
  restaurants: any[] = [];
  tables: any[] = [];

  restaurantId = 1;
  createRestaurantId = 1;
  isAvailable = true;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loadingTables = false;

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.isAdmin$ = this.proxyService.watchIsAdmin();
    this.restaurants$ = this.proxyService.getRestaurants();
    this.restaurants$.subscribe((restaurants) => {
      this.restaurants = restaurants;
      if (restaurants.length) {
        if (!restaurants.some((item) => item.id === this.restaurantId)) {
          this.restaurantId = restaurants[0].id;
        }
        if (!restaurants.some((item) => item.id === this.createRestaurantId)) {
          this.createRestaurantId = restaurants[0].id;
        }
        this.loadTables();
      }
    });
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  loadTables() {
    if (!this.restaurantId) {
      this.tables = [];
      return;
    }

    this.loadingTables = true;
    this.proxyService.getTablesByRestaurant(Number(this.restaurantId)).subscribe({
      next: (tables) => {
        this.tables = tables;
        this.loadingTables = false;
      },
      error: (err) => {
        this.tables = [];
        this.loadingTables = false;
        this.setMessage('error', this.proxyService.extractErrorMessage(err, 'Tables could not be loaded.'));
      }
    });
  }

  createTable() {
    this.setMessage('', '');

    if (!this.createRestaurantId) {
      this.setMessage('error', 'Choose a restaurant ID first.');
      return;
    }

    this.proxyService.createTable({
      restaurantId: Number(this.createRestaurantId),
      isAvailable: this.isAvailable,
    }).subscribe({
      next: (result: any) => {
        const createdId = result?.data?.id;
        this.setMessage('success', createdId ? `Table #${createdId} created successfully.` : 'Table created successfully.');
        this.restaurantId = Number(this.createRestaurantId);
        this.proxyService.refreshTables();
        this.loadTables();
      },
      error: (err) => {
        this.setMessage('error', this.proxyService.extractErrorMessage(err, 'Table could not be created.'));
      }
    });
  }

  toggleAvailability(table: any) {
    const nextValue = !table.isAvailable;
    this.setMessage('', '');

    this.proxyService.updateTableAvailability(Number(table.id), nextValue).subscribe({
      next: (result: any) => {
        this.setMessage('success', typeof result === 'string' ? result : 'Table availability updated.');
        this.loadTables();
      },
      error: (err) => {
        this.setMessage('error', this.proxyService.extractErrorMessage(err, 'Table availability update failed.'));
      }
    });
  }

  getRestaurantName(id: number): string {
    return this.restaurants.find((item) => item.id === id)?.name || `Restaurant ${id}`;
  }
}
