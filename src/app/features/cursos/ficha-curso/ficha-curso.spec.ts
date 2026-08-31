import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichaCurso } from './ficha-curso';

describe('FichaCurso', () => {
  let component: FichaCurso;
  let fixture: ComponentFixture<FichaCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichaCurso],
    }).compileComponents();

    fixture = TestBed.createComponent(FichaCurso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
