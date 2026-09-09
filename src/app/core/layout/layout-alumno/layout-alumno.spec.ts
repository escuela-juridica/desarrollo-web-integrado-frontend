import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { LayoutAlumno } from './layout-alumno';
import { Session } from '../../session/session';

describe('LayoutAlumno', () => {
  let component: LayoutAlumno;
  let fixture: ComponentFixture<LayoutAlumno>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutAlumno],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutAlumno);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cierra la sesión en el backend y navega al catálogo', () => {
    const session = TestBed.inject(Session);
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate');
    session.iniciarSesion({
      nombreCompleto: 'Ana',
      correo: 'ana@example.com',
      rolPrincipal: 'ALUMNO',
    });

    component.cerrarSesion();
    http.expectOne('http://localhost:8080/api/auth/cierre').flush(null);

    expect(session.estaAutenticado()).toBe(false);
    expect(session.usuario()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/catalogo']);
  });
});
