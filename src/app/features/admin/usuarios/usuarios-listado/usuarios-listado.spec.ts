import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UsuariosListado } from './usuarios-listado';

describe('UsuariosListado', () => {
  let component: UsuariosListado;
  let fixture: ComponentFixture<UsuariosListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosListado],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosListado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
