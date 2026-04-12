import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-admin-restaurant-manager',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './admin-restaurant-manager.html',
  styleUrl: './admin-restaurant-manager.css'
})
export class AdminRestaurantManager implements OnInit {
  isAdmin$!: Observable<boolean>;
  restaurants: any[] = [];
  id = 0;
  name = '';
  location = '';
  description = '';
  email = '';
  totalTables = 0;
  seatsPerTable = 0;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private proxyService: ProxyService) {}

  ngOnInit(): void {
    this.isAdmin$ = this.proxyService.watchIsAdmin();
    this.loadRestaurants();
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  loadRestaurants() {
    this.proxyService.getRestaurants().subscribe((data) => this.restaurants = data);
  }

  fillForm(item: any) {
    this.id = item.id;
    this.name = item.name;
    this.location = item.location;
    this.description = item.description;
    this.email = item.email;
    this.totalTables = item.totalTables;
    this.seatsPerTable = item.seatsPerTable;
  }

  clearForm() {
    this.id = 0;
    this.name = '';
    this.location = '';
    this.description = '';
    this.email = '';
    this.totalTables = 0;
    this.seatsPerTable = 0;
  }

  private buildBody() {
    return {
      name: this.name,
      location: this.location,
      description: this.description,
      email: this.email,
      totalTables: Number(this.totalTables),
      seatsPerTable: Number(this.seatsPerTable)
    };
  }

  createRestaurant() {
    this.proxyService.addRestaurant(this.buildBody()).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'Restaurant added.');
        this.clearForm();
        this.loadRestaurants();
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Restaurant create failed.')
    });
  }

  updateRestaurant() {
    if (!this.id) {
      this.setMessage('error', 'Choose a restaurant from the list first.');
      return;
    }

    this.proxyService.updateRestaurant(this.id, this.buildBody()).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'Restaurant updated.');
        this.loadRestaurants();
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Restaurant update failed.')
    });
  }

  deleteRestaurant(id: number) {
    if (!confirm('Delete this restaurant?')) {
      return;
    }

    this.proxyService.deleteRestaurant(id).subscribe({
      next: (result: any) => {
        this.setMessage('success', result?.message || 'Restaurant deleted.');
        this.loadRestaurants();
        if (this.id === id) {
          this.clearForm();
        }
      },
      error: (err) => this.setMessage('error', err?.error?.message || err?.error || 'Restaurant delete failed.')
    });
  }
}
