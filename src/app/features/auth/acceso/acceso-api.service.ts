import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/api/api.config';

export interface LoginPeticion {
  correo: string;
  contrasena: string;
}

export interface LoginRespuesta {
  token: string;
  nombreCompleto: string;
  correo: string;
  fotoUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AccesoApiService {
  private readonly http = inject(HttpClient);
  private readonly urlAcceso = `${API_URL}/auth/login`;

  login(peticion: LoginPeticion): Observable<LoginRespuesta> {
    return this.http.post<LoginRespuesta>(this.urlAcceso, peticion);
  }
}