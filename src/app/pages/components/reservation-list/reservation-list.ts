import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-reservation-list',
  imports: [AsyncPipe, DatePipe, FormsModule],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css',
})
export class ReservationList implements OnInit {
  data$!: Observable<any[]>;
  restaurants$!: Observable<any[]>;
  availableTables$!: Observable<any[]>;
  restaurants: any[] = [];
  availableTables: any[] = [];
  availableTableIdsText = '';

  restaurantId = 1;
  date = '';
  tableNumber = 0;
  guestCount = 2;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.watchMyReservations();
    this.restaurants$ = this.proxyService.getRestaurants();
    this.restaurants$.subscribe((data) => {
      this.restaurants = data;
      if (data.length && !data.some((item) => item.id === this.restaurantId)) {
        this.restaurantId = data[0].id;
      }
      this.loadAvailableTables();
    });
    this.setDefaultDate();
  }

  setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.date = tomorrow.toISOString().slice(0, 16);
  }

  onRestaurantChange() {
    this.tableNumber = 0;
    this.loadAvailableTables();
  }

  loadAvailableTables() {
    this.availableTables$ = this.proxyService.getAvailableTables(Number(this.restaurantId));
    this.availableTables$.subscribe((tables) => {
      this.availableTables = tables;
      this.availableTableIdsText = tables.map((table) => table.id).join(', ');

      if (!tables.length) {
        this.tableNumber = 0;
        return;
      }

      const currentExists = tables.some((table) => Number(table.id) === Number(this.tableNumber));
      if (!currentExists) {
        this.tableNumber = Number(tables[0].id);
      }
    });
  }

  createReservation() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.proxyService.isLoggedIn()) {
      this.errorMessage = 'Login first to create a reservation.';
      return;
    }

    if (!this.restaurantId || !this.date || !this.tableNumber || !this.guestCount) {
      this.errorMessage = 'Please fill in all reservation fields.';
      return;
    }

    this.submitting = true;

    this.proxyService.createReservation({
      restaurantId: Number(this.restaurantId),
      date: new Date(this.date).toISOString(),
      tableNumber: Number(this.tableNumber),
      guestCount: Number(this.guestCount),
      statusId: 1
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Reservation created successfully.';
        this.proxyService.refreshReservations();
        this.loadAvailableTables();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = this.proxyService.extractErrorMessage(err, 'Reservation could not be created.');
      }
    });
  }

  deleteReservation(id: number) {
    this.errorMessage = '';
    this.successMessage = '';

    this.proxyService.deleteReservation(id).subscribe({
      next: () => {
        this.successMessage = 'Reservation deleted successfully.';
        this.proxyService.refreshReservations();
      },
      error: (err) => {
        this.errorMessage = this.proxyService.extractErrorMessage(err, 'Reservation could not be deleted.');
      }
    });
  }

  getRestaurantName(id: number) {
    return this.restaurants.find((item) => item.id === id)?.name || `Restaurant ${id}`;
  }

  cancelReservation(id: number) {
    this.errorMessage = '';
    this.successMessage = '';

    this.proxyService.cancelReservation(id).subscribe({
      next: () => {
        this.successMessage = 'Reservation cancelled successfully.';
        this.proxyService.refreshReservations();
      },
      error: (err) => {
        this.errorMessage = this.proxyService.extractErrorMessage(err, 'Reservation could not be cancelled.');
      }
    });
  }

  getStatusLabel(statusId: number) {
    if (statusId === 1) return 'Pending';
    if (statusId === 2) return 'Confirmed';
    if (statusId === 3) return 'Canceled';
    return 'Unknown';
  }
}
