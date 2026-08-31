import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaPassword } from './nueva-password';

describe('NuevaPassword', () => {
  let component: NuevaPassword;
  let fixture: ComponentFixture<NuevaPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaPassword],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
