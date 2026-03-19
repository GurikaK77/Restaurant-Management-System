import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalCustomers } from './total-customers';

describe('TotalCustomers', () => {
  let component: TotalCustomers;
  let fixture: ComponentFixture<TotalCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalCustomers],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalCustomers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
