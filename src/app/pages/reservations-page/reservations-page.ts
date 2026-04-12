import { Component } from '@angular/core';
import { ReservationList } from '../components/reservation-list/reservation-list';
import { ReservationStatus } from '../components/reservation-status/reservation-status';

@Component({
  selector: 'app-reservations-page',
  imports: [ReservationList, ReservationStatus],
  templateUrl: './reservations-page.html'
})
export class ReservationsPage {}
