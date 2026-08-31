import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutAlumno } from './layout-alumno';

describe('LayoutAlumno', () => {
  let component: LayoutAlumno;
  let fixture: ComponentFixture<LayoutAlumno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutAlumno],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutAlumno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
