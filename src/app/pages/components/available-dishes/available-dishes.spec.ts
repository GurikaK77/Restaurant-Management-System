import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableDishes } from './available-dishes';

describe('AvailableDishes', () => {
  let component: AvailableDishes;
  let fixture: ComponentFixture<AvailableDishes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableDishes],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableDishes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
