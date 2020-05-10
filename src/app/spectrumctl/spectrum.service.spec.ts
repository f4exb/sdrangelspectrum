import { TestBed } from '@angular/core/testing';

import { SpectrumService } from './spectrum.service';

describe('SpectrumService', () => {
  let service: SpectrumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpectrumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
