import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UsuarioAdminDetalle } from '../usuario-admin.model';
import { UsuariosAdminMockService } from '../usuarios-admin-mock.service';

/** ⚠️ NO ES LA VERSIÓN FINAL: lee/actualiza contra UsuariosAdminMockService (en memoria), no
 * contra un backend real. Ver el comentario de ese servicio. */
@Component({
  selector: 'app-usuario-detalle',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.scss',
})
export class UsuarioDetalle implements OnInit {
  protected readonly servicio = inject(UsuariosAdminMockService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly usuario = signal<UsuarioAdminDetalle | null | undefined>(undefined);
  protected readonly errorCambioEstado = signal<string | null>(null);
  protected readonly errorEliminar = signal<string | null>(null);
  protected readonly editando = signal(false);
  protected readonly errorEdicion = signal<string | null>(null);
  protected readonly guardadoOk = signal(false);

  protected readonly formulario = this.fb.group({
    nombres: ['', [Validators.required, Validators.maxLength(120)]],
    apellidoPaterno: ['', [Validators.required, Validators.maxLength(80)]],
    apellidoMaterno: ['', [Validators.maxLength(80)]],
    telefono: ['', [Validators.maxLength(30)]],
    documentoIdentidad: ['', [Validators.maxLength(30)]],
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

  ngOnInit(): void {
    this.ruta.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((parametros) => {
      const id = Number(parametros.get('id'));
      this.usuario.set(Number.isFinite(id) ? this.servicio.obtener(id) : null);
    });
  }

  protected campoInvalido(
    nombre: 'nombres' | 'apellidoPaterno' | 'apellidoMaterno' | 'telefono' | 'documentoIdentidad',
  ): boolean {
    return this.formulario.controls[nombre].invalid && this.formulario.controls[nombre].touched;
  }

  protected servicioEstadoEtiqueta(): string {
    const usuario = this.usuario();
    return usuario ? this.servicio.etiquetaEstadoCuenta(usuario) : '';
  }

  protected servicioEstadoClase(): string {
    const usuario = this.usuario();
    return usuario ? this.servicio.claseEstadoCuenta(usuario) : '';
  }

  protected cambiarEstado(activo: boolean): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    this.errorCambioEstado.set(null);
    const error = this.servicio.cambiarEstado(usuario.usuarioId, activo);
    if (error) {
      this.errorCambioEstado.set(error);
      return;
    }
    this.usuario.set(this.servicio.obtener(usuario.usuarioId));
  }

  protected eliminar(): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    const confirmado = confirm(
      `¿Eliminar permanentemente a "${usuario.nombreCompleto}"? Esto no se puede deshacer.`,
    );
    if (!confirmado) {
      return;
    }

    this.errorEliminar.set(null);
    const error = this.servicio.eliminar(usuario.usuarioId);
    if (error) {
      this.errorEliminar.set(error);
      return;
    }
    void this.router.navigate(['/admin/usuarios']);
  }

  protected iniciarEdicion(): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    this.formulario.setValue({
      nombres: usuario.nombres,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno ?? '',
      telefono: usuario.telefono ?? '',
      documentoIdentidad: usuario.documentoIdentidad ?? '',
    });
    this.errorEdicion.set(null);
    this.guardadoOk.set(false);
    this.editando.set(true);
  }

  protected cancelarEdicion(): void {
    this.editando.set(false);
  }

  protected guardarEdicion(): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const error = this.servicio.actualizar(usuario.usuarioId, {
      nombres: valores.nombres.trim(),
      apellidoPaterno: valores.apellidoPaterno.trim(),
      apellidoMaterno: this.textoOpcional(valores.apellidoMaterno),
      telefono: this.textoOpcional(valores.telefono),
      documentoIdentidad: this.textoOpcional(valores.documentoIdentidad),
    });

    if (error) {
      this.errorEdicion.set(error);
      return;
    }

    this.usuario.set(this.servicio.obtener(usuario.usuarioId));
    this.editando.set(false);
    this.guardadoOk.set(true);
  }

  private textoOpcional(valor: string): string | null {
    const limpio = valor.trim();
    return limpio.length > 0 ? limpio : null;
  }
}
