import { TestBed } from '@angular/core/testing';

import { NgxSmartCropperService } from './ngx-smart-cropper.service';

describe('NgxSmartCropperService', () => {
  let service: NgxSmartCropperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSmartCropperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
