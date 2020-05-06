import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsspectrumComponent } from './wsspectrum.component';

describe('WsspectrumComponent', () => {
  let component: WsspectrumComponent;
  let fixture: ComponentFixture<WsspectrumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsspectrumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsspectrumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
