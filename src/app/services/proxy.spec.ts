import { TestBed } from '@angular/core/testing';

import { Proxy } from './proxy';

describe('Proxy', () => {
  let service: Proxy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proxy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
