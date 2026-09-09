import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CrearUsuarioAdminRespuesta, RolUsuarioAdmin } from '../usuario-admin.model';
import { UsuariosAdminMockService } from '../usuarios-admin-mock.service';

/** ⚠️ NO ES LA VERSIÓN FINAL: guarda contra UsuariosAdminMockService (en memoria), no contra un
 * backend real; no envía ningún correo de verdad. Ver el comentario de ese servicio. */
@Component({
  selector: 'app-usuario-crear',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-crear.html',
  styleUrl: './usuario-crear.scss',
})
export class UsuarioCrear {
  private readonly servicio = inject(UsuariosAdminMockService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly intentoGuardar = signal(false);
  protected readonly resultado = signal<CrearUsuarioAdminRespuesta | null>(null);

  protected readonly formulario = this.fb.group({
    nombres: ['', [Validators.required, Validators.maxLength(120)]],
    apellidoPaterno: ['', [Validators.required, Validators.maxLength(80)]],
    apellidoMaterno: ['', [Validators.maxLength(80)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    telefono: ['', [Validators.maxLength(30)]],
    documentoIdentidad: ['', [Validators.maxLength(30)]],
    rol: this.fb.control<RolUsuarioAdmin>('ALUMNO'),
  });

  constructor() {
    for (const nombre of ['nombres', 'apellidoPaterno', 'apellidoMaterno'] as const) {
      const control = this.formulario.controls[nombre];
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
        const mayuscula = valor.toLocaleUpperCase('es-PE');
        if (valor !== mayuscula) {
          control.setValue(mayuscula, { emitEvent: false });
        }
      });
    }
  }

  protected campoInvalido(
    nombre: 'nombres' | 'apellidoPaterno' | 'apellidoMaterno' | 'correo' | 'telefono' | 'documentoIdentidad',
  ): boolean {
    const control = this.formulario.controls[nombre];
    return control.invalid && (control.touched || this.intentoGuardar());
  }

  protected crear(): void {
    this.intentoGuardar.set(true);
    this.resultado.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const respuesta = this.servicio.crear({
      nombres: valores.nombres.trim(),
      apellidoPaterno: valores.apellidoPaterno.trim(),
      apellidoMaterno: this.textoOpcional(valores.apellidoMaterno),
      correo: valores.correo.trim(),
      telefono: this.textoOpcional(valores.telefono),
      documentoIdentidad: this.textoOpcional(valores.documentoIdentidad),
      rol: valores.rol,
    });

    this.resultado.set(respuesta);
  }

  protected verDetalle(): void {
    const usuarioId = this.resultado()?.usuario.usuarioId;
    if (usuarioId != null) {
      void this.router.navigate(['/admin/usuarios', usuarioId]);
    }
  }

  private textoOpcional(valor: string): string | null {
    const limpio = valor.trim();
    return limpio.length > 0 ? limpio : null;
  }
}
