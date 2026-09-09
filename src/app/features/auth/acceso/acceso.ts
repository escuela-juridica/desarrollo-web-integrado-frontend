import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Session } from '../../../core/session/session';
import { AccesoApiService } from './acceso-api.service';

@Component({
  selector: 'app-acceso',
  imports: [FormsModule, RouterLink],
  templateUrl: './acceso.html',
  styleUrl: './acceso.scss',
})
export class Acceso {
  private readonly accesoApi = inject(AccesoApiService);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  credenciales = { correo: '', contrasena: '' };
  mostrarPassword = false;
  cargando = false;
  mensajeError = '';

  onLogin(): void {
    if (this.cargando || !this.credenciales.correo.trim() || !this.credenciales.contrasena) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.accesoApi
      .login({
        correo: this.credenciales.correo.trim().toLowerCase(),
        contrasena: this.credenciales.contrasena,
      })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (respuesta) => {
          this.session.iniciarSesion({
            nombre: respuesta.nombreCompleto,
            email: respuesta.correo,
            rol: 'alumno',
          });
          void this.router.navigate(['/app/panel']);
        },
        error: (error: HttpErrorResponse) => {
          this.mensajeError = this.obtenerMensajeError(error);
        },
      });
  }

  loginConGoogle(): void {
    this.mensajeError = 'El acceso con Google todavía no está disponible.';
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    const mensaje = error.error?.message;
    return typeof mensaje === 'string' && mensaje.trim()
      ? mensaje
      : 'El correo o la contraseña no son correctos.';
  }
}
