import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayReservations } from './today-reservations';

describe('TodayReservations', () => {
  let component: TodayReservations;
  let fixture: ComponentFixture<TodayReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayReservations],
    }).compileComponents();

    fixture = TestBed.createComponent(TodayReservations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
