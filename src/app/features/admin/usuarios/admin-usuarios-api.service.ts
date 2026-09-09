import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/api/api.config';
import {
  ActualizarUsuarioAdminPeticion,
  CrearUsuarioAdminPeticion,
  CrearUsuarioAdminRespuesta,
  RolUsuarioAdmin,
  UsuarioAdminDetalle,
} from './usuario-admin.model';

/**
 * ⚠️ IMPLEMENTACIÓN TEMPORAL, solo para la Épica 01, pedida explícitamente por el docente: llama a
 * `/api/admin/usuarios`, un CRUD REST básico SIN base de datos (los datos viven en memoria en el
 * backend y se reinician con cada arranque). A propósito no está integrado con el login/JWT de la
 * app: es un endpoint público, separado de los usuarios administradores reales. Ver el comentario
 * del paquete `pe.edu.utp.escuela.app.adminusuarios` en el backend para más contexto.
 *
 * Cuando se implemente la Épica 02 (panel de administración real, EP02-PF-010), este servicio y
 * los componentes que lo consumen deben eliminarse junto con ese paquete del backend.
 */
@Injectable({ providedIn: 'root' })
export class AdminUsuariosApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/usuarios`;

  listar(busqueda: string, rol: RolUsuarioAdmin | 'TODOS'): Observable<UsuarioAdminDetalle[]> {
    let params = new HttpParams();
    if (busqueda.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }
    if (rol !== 'TODOS') {
      params = params.set('rol', rol);
    }
    return this.http.get<UsuarioAdminDetalle[]>(this.url, { params });
  }

  obtener(usuarioId: number): Observable<UsuarioAdminDetalle> {
    return this.http.get<UsuarioAdminDetalle>(`${this.url}/${usuarioId}`);
  }

  crear(peticion: CrearUsuarioAdminPeticion): Observable<CrearUsuarioAdminRespuesta> {
    return this.http.post<CrearUsuarioAdminRespuesta>(this.url, peticion);
  }

  actualizar(usuarioId: number, peticion: ActualizarUsuarioAdminPeticion): Observable<UsuarioAdminDetalle> {
    return this.http.put<UsuarioAdminDetalle>(`${this.url}/${usuarioId}`, peticion);
  }

  cambiarEstado(usuarioId: number, activo: boolean): Observable<void> {
    return this.http.put<void>(`${this.url}/${usuarioId}/estado`, { activo });
  }

  eliminar(usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${usuarioId}`);
  }
}
