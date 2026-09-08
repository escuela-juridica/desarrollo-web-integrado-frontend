import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutAlumno } from './layout-alumno';
import { provideRouter } from '@angular/router';
import { Session } from '../../session/session';

describe('LayoutAlumno', () => {
  let component: LayoutAlumno;
  let fixture: ComponentFixture<LayoutAlumno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutAlumno],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutAlumno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no simula cerrar una cookie cuando aún falta el servicio compartido', () => {
    const session = TestBed.inject(Session);
    session.iniciarSesion({ nombre: 'Ana', email: 'ana@example.com', rol: 'alumno' });
    component.cerrarSesion();
    expect(session.estaAutenticado()).toBe(true);
    expect(session.usuario()?.email).toBe('ana@example.com');
  });
});
