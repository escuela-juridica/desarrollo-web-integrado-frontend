import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UsuarioDetalle } from './usuario-detalle';

describe('UsuarioDetalle', () => {
  let component: UsuarioDetalle;
  let fixture: ComponentFixture<UsuarioDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioDetalle],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '1' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
