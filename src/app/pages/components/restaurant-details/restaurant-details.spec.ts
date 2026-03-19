import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantDetails } from './restaurant-details';

describe('RestaurantDetails', () => {
  let component: RestaurantDetails;
  let fixture: ComponentFixture<RestaurantDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
