import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishDetails } from './dish-details';

describe('DishDetails', () => {
  let component: DishDetails;
  let fixture: ComponentFixture<DishDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(DishDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
