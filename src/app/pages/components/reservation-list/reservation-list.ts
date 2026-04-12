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

  restaurantId = 1;
  date = '';
  tableNumber = 1;
  guestCount = 2;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.data$ = this.proxyService.watchMyReservations();
    this.restaurants$ = this.proxyService.getRestaurants();
    this.setDefaultDate();
  }

  setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.date = tomorrow.toISOString().slice(0, 16);
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
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error || 'Reservation could not be created.';
      }
    });
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
        this.errorMessage = err?.error || 'Reservation could not be cancelled.';
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
