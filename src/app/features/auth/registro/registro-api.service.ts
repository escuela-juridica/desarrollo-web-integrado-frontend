import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioSesion } from '../../../core/session/session';

import {
  ContextoRegistroGoogle,
  RegistroFormularioPeticion,
  RegistroFormularioRespuesta,
  RegistroGooglePeticion,
} from './registro.models';

@Injectable({ providedIn: 'root' })
export class RegistroApiService {
  private readonly http = inject(HttpClient);
  private readonly urlRegistro = '/api/auth/registro';

  registrarFormulario(
    peticion: RegistroFormularioPeticion,
  ): Observable<RegistroFormularioRespuesta> {
    return this.http.post<RegistroFormularioRespuesta>(this.urlRegistro, peticion);
  }

  obtenerContextoGoogle(referencia: string): Observable<ContextoRegistroGoogle> {
    const referenciaSegura = encodeURIComponent(referencia);
    return this.http.get<ContextoRegistroGoogle>(`${this.urlRegistro}/google/${referenciaSegura}`);
  }

  completarRegistroGoogle(peticion: RegistroGooglePeticion): Observable<UsuarioSesion> {
    return this.http.post<UsuarioSesion>(`${this.urlRegistro}/google`, peticion);
  }
}
