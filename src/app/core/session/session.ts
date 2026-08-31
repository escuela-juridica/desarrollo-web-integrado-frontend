import { Injectable, signal } from '@angular/core';

export interface UsuarioSesion {
  nombre: string;
  email: string;
  rol: 'alumno' | 'administrador';
}

/**
 * Estado de la sesion actual. HU-001: login con correo o Google.
 * La logica real (llamada al backend, guardado de token) se agrega junto con esa historia;
 * esto solo deja el punto unico que el guard y el header ya pueden consultar.
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
