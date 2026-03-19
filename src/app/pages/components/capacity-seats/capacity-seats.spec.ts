import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacitySeats } from './capacity-seats';

describe('CapacitySeats', () => {
  let component: CapacitySeats;
  let fixture: ComponentFixture<CapacitySeats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacitySeats],
    }).compileComponents();

    fixture = TestBed.createComponent(CapacitySeats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
