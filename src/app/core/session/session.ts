import { Injectable, signal } from '@angular/core';

export interface UsuarioSesion {
  nombre: string;
  email: string;
  rol: 'alumno' | 'administrador';
}

/**
 * Estado de la sesion actual. HU-001: login con correo o Google.
 * Datos de presentación recibidos desde el servidor. La credencial vive en una
 * cookie HttpOnly; no se guarda el JWT en localStorage ni en este servicio.
 */
@Injectable({
  providedIn: 'root',
})
export class Session {
  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly estaAutenticado = signal(false);

  iniciarSesion(usuario: UsuarioSesion): void {
    this.usuario.set(usuario);
    this.estaAutenticado.set(true);
  }

  cerrarSesion(): void {
    this.usuario.set(null);
    this.estaAutenticado.set(false);
  }
}
