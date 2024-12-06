import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSmartCropperComponent } from './ngx-smart-cropper.component';

describe('NgxSmartCropperComponent', () => {
  let component: NgxSmartCropperComponent;
  let fixture: ComponentFixture<NgxSmartCropperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSmartCropperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxSmartCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
