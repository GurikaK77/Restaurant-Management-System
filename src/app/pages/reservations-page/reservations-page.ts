import { Component } from '@angular/core';
import { ReservationList } from '../components/reservation-list/reservation-list';
import { ReservationStatus } from '../components/reservation-status/reservation-status';
import { AdminReservationManager } from '../components/admin-reservation-manager/admin-reservation-manager';

@Component({
  selector: 'app-reservations-page',
  imports: [ReservationList, ReservationStatus, AdminReservationManager],
  templateUrl: './reservations-page.html'
})
export class ReservationsPage {}
