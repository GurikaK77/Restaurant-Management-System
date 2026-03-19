import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalMenus } from './total-menus';

describe('TotalMenus', () => {
  let component: TotalMenus;
  let fixture: ComponentFixture<TotalMenus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalMenus],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalMenus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
