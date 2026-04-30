import { TestBed } from '@angular/core/testing';

import { Tmdb } from './tmdb';

describe('Tmdb', () => {
  let service: Tmdb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tmdb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
