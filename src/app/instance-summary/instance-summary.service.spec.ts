import { TestBed } from '@angular/core/testing';

import { InstanceSummaryService } from './instance-summary.service';

describe('InstanceSummaryService', () => {
  let service: InstanceSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstanceSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
