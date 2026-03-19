import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalRestaurants } from './total-restaurants';

describe('TotalRestaurants', () => {
  let component: TotalRestaurants;
  let fixture: ComponentFixture<TotalRestaurants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalRestaurants],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalRestaurants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
