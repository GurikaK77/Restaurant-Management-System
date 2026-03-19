import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryInfo } from './summary-info';

describe('SummaryInfo', () => {
  let component: SummaryInfo;
  let fixture: ComponentFixture<SummaryInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
