import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectrumctlComponent } from './spectrumctl.component';

describe('SpectrumctlComponent', () => {
  let component: SpectrumctlComponent;
  let fixture: ComponentFixture<SpectrumctlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpectrumctlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectrumctlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
