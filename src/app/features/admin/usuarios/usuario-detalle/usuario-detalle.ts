import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminUsuariosApiService } from '../admin-usuarios-api.service';
import { claseEstadoCuenta, etiquetaEstadoCuenta, etiquetaOtorgadoPor } from '../usuario-admin-etiquetas';
import { UsuarioAdminDetalle } from '../usuario-admin.model';

interface ErrorApiAdmin {
  code?: string;
  message?: string;
}

/** ⚠️ NO ES LA VERSIÓN FINAL: lee/actualiza contra `/api/admin/usuarios`, una API REST real pero
 * sin base de datos. Ver el comentario de AdminUsuariosApiService. */
@Component({
  selector: 'app-usuario-detalle',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.scss',
})
export class UsuarioDetalle implements OnInit {
  private readonly api = inject(AdminUsuariosApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly detector = inject(ChangeDetectorRef);

  protected readonly usuario = signal<UsuarioAdminDetalle | null | undefined>(undefined);
  protected readonly cambiandoEstado = signal(false);
  protected readonly errorCambioEstado = signal<string | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly errorEliminar = signal<string | null>(null);
  protected readonly editando = signal(false);
  protected readonly guardandoEdicion = signal(false);
  protected readonly errorEdicion = signal<string | null>(null);
  protected readonly guardadoOk = signal(false);

  protected readonly etiquetaOtorgadoPor = etiquetaOtorgadoPor;

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
      if (!Number.isFinite(id)) {
        this.usuario.set(null);
        return;
      }
      this.cargar(id);
    });
  }

  protected campoInvalido(
    nombre: 'nombres' | 'apellidoPaterno' | 'apellidoMaterno' | 'telefono' | 'documentoIdentidad',
  ): boolean {
    return this.formulario.controls[nombre].invalid && this.formulario.controls[nombre].touched;
  }

  protected servicioEstadoEtiqueta(): string {
    const usuario = this.usuario();
    return usuario ? etiquetaEstadoCuenta(usuario) : '';
  }

  protected servicioEstadoClase(): string {
    const usuario = this.usuario();
    return usuario ? claseEstadoCuenta(usuario) : '';
  }

  protected cambiarEstado(activo: boolean): void {
    const usuario = this.usuario();
    if (!usuario || this.cambiandoEstado()) {
      return;
    }
    this.errorCambioEstado.set(null);
    this.cambiandoEstado.set(true);
    this.api
      .cambiarEstado(usuario.usuarioId, activo)
      .pipe(
        finalize(() => {
          this.cambiandoEstado.set(false);
          this.detector.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.cargar(usuario.usuarioId),
        error: (error: HttpErrorResponse) => {
          this.errorCambioEstado.set(
            this.obtenerErrorApi(error)?.message ?? 'No pudimos cambiar el estado de la cuenta.',
          );
        },
      });
  }

  protected eliminar(): void {
    const usuario = this.usuario();
    if (!usuario || this.eliminando()) {
      return;
    }
    const confirmado = confirm(
      `¿Eliminar permanentemente a "${usuario.nombreCompleto}"? Esto no se puede deshacer.`,
    );
    if (!confirmado) {
      return;
    }

    this.errorEliminar.set(null);
    this.eliminando.set(true);
    this.api
      .eliminar(usuario.usuarioId)
      .pipe(
        finalize(() => {
          this.eliminando.set(false);
          this.detector.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigate(['/admin/usuarios']),
        error: (error: HttpErrorResponse) => {
          this.errorEliminar.set(
            this.obtenerErrorApi(error)?.message ?? 'No pudimos eliminar la cuenta.',
          );
        },
      });
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
    if (!usuario || this.guardandoEdicion()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardandoEdicion.set(true);
    this.api
      .actualizar(usuario.usuarioId, {
        nombres: valores.nombres.trim(),
        apellidoPaterno: valores.apellidoPaterno.trim(),
        apellidoMaterno: this.textoOpcional(valores.apellidoMaterno),
        telefono: this.textoOpcional(valores.telefono),
        documentoIdentidad: this.textoOpcional(valores.documentoIdentidad),
      })
      .pipe(
        finalize(() => {
          this.guardandoEdicion.set(false);
          this.detector.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (actualizado) => {
          this.usuario.set(actualizado);
          this.editando.set(false);
          this.guardadoOk.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.errorEdicion.set(
            this.obtenerErrorApi(error)?.message ?? 'No pudimos guardar los cambios.',
          );
        },
      });
  }

  private cargar(usuarioId: number): void {
    this.api
      .obtener(usuarioId)
      .pipe(
        finalize(() => this.detector.markForCheck()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (usuario) => this.usuario.set(usuario),
        error: () => this.usuario.set(null),
      });
  }

  private obtenerErrorApi(error: HttpErrorResponse): ErrorApiAdmin | null {
    if (typeof error.error !== 'object' || error.error === null) {
      return null;
    }
    return error.error as ErrorApiAdmin;
  }

  private textoOpcional(valor: string): string | null {
    const limpio = valor.trim();
    return limpio.length > 0 ? limpio : null;
  }
}
