import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProxyService } from '../../../services/proxy.service';

@Component({
  selector: 'app-admin-reservation-manager',
  imports: [FormsModule, AsyncPipe, DatePipe],
  templateUrl: './admin-reservation-manager.html',
  styleUrl: './admin-reservation-manager.css'
})
export class AdminReservationManager implements OnInit {
  isAdmin$!: Observable<boolean>;
  reservations: any[] = [];
  searchDate = '';
  reservationId = 0;
  selectedReservation: any | null = null;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;

  constructor(public proxyService: ProxyService) {}

  ngOnInit(): void {
    this.isAdmin$ = this.proxyService.watchIsAdmin();
    this.loadAll();
  }

  private setMessage(type: 'success' | 'error' | '', text: string) {
    this.messageType = type;
    this.message = text;
  }

  loadAll() {
    this.loading = true;
    this.proxyService.getAllReservations().subscribe({
      next: (data) => {
        this.loading = false;
        this.reservations = data;
      },
      error: () => {
        this.loading = false;
        this.reservations = [];
      }
    });
  }

  filterByDate() {
    if (!this.searchDate) {
      this.loadAll();
      return;
    }

    this.proxyService.getReservationsByDate(this.searchDate).subscribe({
      next: (data) => {
        this.reservations = data;
        this.setMessage('success', `Loaded reservations for ${this.searchDate}.`);
      },
      error: (err) => {
        this.setMessage('error', err?.error || 'Could not load reservations by date.');
      }
    });
  }

  lookupReservation() {
    if (!this.reservationId) {
      return;
    }

    this.proxyService.getReservationById(Number(this.reservationId)).subscribe({
      next: (data) => {
        this.selectedReservation = data;
        if (!data) {
          this.setMessage('error', 'Reservation not found.');
        }
      },
      error: (err) => {
        this.setMessage('error', err?.error || 'Reservation lookup failed.');
      }
    });
  }

  updateStatus(id: number, statusId: number) {
    this.proxyService.updateReservationStatus(id, statusId).subscribe({
      next: () => {
        this.setMessage('success', 'Reservation status updated.');
        this.loadAll();
      },
      error: (err) => this.setMessage('error', err?.error || 'Status update failed.')
    });
  }

  deleteReservation(id: number) {
    if (!confirm('Delete this reservation?')) {
      return;
    }

    this.proxyService.deleteReservation(id).subscribe({
      next: () => {
        this.setMessage('success', 'Reservation deleted.');
        this.loadAll();
      },
      error: (err) => this.setMessage('error', err?.error || 'Delete failed.')
    });
  }
}
