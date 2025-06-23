import { TestBed } from '@angular/core/testing';

import { PlanningTableService } from './planning-table.service';

describe('PlanningTableService', () => {
  let service: PlanningTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
