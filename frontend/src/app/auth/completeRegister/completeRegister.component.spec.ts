import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteRegisterComponent } from './completeRegister.component';

describe('CompleteRegisterComponent', () => {
  let component: CompleteRegisterComponent;
  let fixture: ComponentFixture<CompleteRegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteRegisterComponent]
    });
    fixture = TestBed.createComponent(CompleteRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
