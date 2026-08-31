import { TestBed } from '@angular/core/testing';

import { Cuenta } from './cuenta';

describe('Cuenta', () => {
  let service: Cuenta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cuenta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
