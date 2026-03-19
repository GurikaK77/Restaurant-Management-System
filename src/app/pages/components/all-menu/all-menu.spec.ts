import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMenu } from './all-menu';

describe('AllMenu', () => {
  let component: AllMenu;
  let fixture: ComponentFixture<AllMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(AllMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
