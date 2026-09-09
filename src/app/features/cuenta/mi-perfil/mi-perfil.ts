import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import { Session } from '../../../core/session/session';
import {
  contrasenasCoincidenValidator,
  politicaContrasenaValidator,
} from '../../auth/registro/registro.validators';
import { PerfilApiService } from './perfil-api.service';
import { PerfilRespuesta } from './perfil.models';
import {
  documentoOpcionalValidator,
  nombrePropioValidator,
  telefonoOpcionalValidator,
} from './mi-perfil.validators';

type EstadoCarga = 'cargando' | 'listo' | 'no-autorizado' | 'error';
type Pestana = 'datos' | 'seguridad';

interface ErrorApiPerfil {
  code?: string;
  message?: string;
}

@Component({
  selector: 'app-mi-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  private readonly api = inject(PerfilApiService);
  private readonly session = inject(Session);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly detector = inject(ChangeDetectorRef);

  protected readonly estadoCarga = signal<EstadoCarga>('cargando');
  protected readonly perfil = signal<PerfilRespuesta | null>(null);
  protected readonly pestana = signal<Pestana>('datos');

  protected readonly guardando = signal(false);
  protected readonly guardadoOk = signal(false);
  protected readonly errorGuardado = signal<string | null>(null);
  protected readonly intentoGuardar = signal(false);
  protected readonly documentoDuplicado = signal(false);

  protected readonly guardandoContrasena = signal(false);
  protected readonly contrasenaCreada = signal(false);
  protected readonly errorContrasena = signal<string | null>(null);
  protected readonly intentoContrasena = signal(false);
  protected mostrarContrasena = false;
  protected mostrarConfirmacion = false;

  protected readonly formulario = this.fb.group({
    nombres: ['', [Validators.required, Validators.maxLength(120), nombrePropioValidator]],
    apellidoPaterno: ['', [Validators.required, Validators.maxLength(80), nombrePropioValidator]],
    apellidoMaterno: ['', [Validators.maxLength(80), nombrePropioValidator]],
    telefono: ['', [Validators.maxLength(30), telefonoOpcionalValidator]],
    documentoIdentidad: ['', [Validators.maxLength(30), documentoOpcionalValidator]],
  });

  protected readonly formularioContrasena = this.fb.group(
    {
      contrasena: ['', [Validators.required, politicaContrasenaValidator]],
      confirmarContrasena: ['', [Validators.required]],
    },
    { validators: contrasenasCoincidenValidator },
  );

  ngOnInit(): void {
    this.api
      .obtener()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.aplicarPerfil(perfil);
          this.estadoCarga.set('listo');
        },
        error: (error: HttpErrorResponse) => {
          this.estadoCarga.set(error.status === 401 ? 'no-autorizado' : 'error');
        },
      });

    for (const nombre of ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'telefono', 'documentoIdentidad'] as const) {
      this.formulario.controls[nombre].valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.guardadoOk.set(false);
          this.documentoDuplicado.set(false);
          this.detector.markForCheck();
        });
    }

    // Los nombres se guardan en mayúsculas (igual que en el registro), para que coincidan
    // con el formato de los documentos de identidad.
    for (const nombre of ['nombres', 'apellidoPaterno', 'apellidoMaterno'] as const) {
      const control = this.formulario.controls[nombre];
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
        const mayuscula = valor.toLocaleUpperCase('es-PE');
        if (valor !== mayuscula) {
          control.setValue(mayuscula, { emitEvent: false });
        }
      });
    }

    for (const nombre of ['contrasena', 'confirmarContrasena'] as const) {
      this.formularioContrasena.controls[nombre].valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.contrasenaCreada.set(false);
          this.detector.markForCheck();
        });
    }
  }

  protected cambiarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
  }

  protected get mostrarPestanaSeguridad(): boolean {
    return this.contrasenaCreada() || !!this.perfil()?.puedeCrearContrasena;
  }

  protected get inicialesUsuario(): string {
    const perfil = this.perfil();
    if (!perfil) {
      return '';
    }
    return `${perfil.nombres.charAt(0)}${perfil.apellidoPaterno.charAt(0)}`.toUpperCase();
  }

  protected get nombreCompletoActual(): string {
    const perfil = this.perfil();
    return perfil ? this.nombreCompleto(perfil) : '';
  }

  protected campoInvalido(nombre: 'nombres' | 'apellidoPaterno' | 'apellidoMaterno' | 'telefono' | 'documentoIdentidad'): boolean {
    const control = this.formulario.controls[nombre];
    return control.invalid && (control.touched || this.intentoGuardar());
  }

  protected get valorContrasena(): string {
    return this.formularioContrasena.controls.contrasena.value;
  }

  protected get cumpleLongitud(): boolean {
    return this.valorContrasena.length >= 8;
  }

  protected get cumpleMayuscula(): boolean {
    return /\p{Uppercase}/u.test(this.valorContrasena);
  }

  protected get cumpleMinuscula(): boolean {
    return /\p{Lowercase}/u.test(this.valorContrasena);
  }

  protected get cumpleNumero(): boolean {
    return /\p{Nd}/u.test(this.valorContrasena);
  }

  protected get confirmacionContrasenaInvalida(): boolean {
    const confirmacion = this.formularioContrasena.controls.confirmarContrasena;
    const debeMostrarError = confirmacion.touched || this.intentoContrasena();
    const noCoincide = this.formularioContrasena.hasError('contrasenasDiferentes');
    return debeMostrarError && (confirmacion.invalid || noCoincide);
  }

  protected guardar(): void {
    if (this.guardando()) {
      return;
    }

    this.intentoGuardar.set(true);
    this.errorGuardado.set(null);
    this.guardadoOk.set(false);
    this.documentoDuplicado.set(false);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardando.set(true);
    this.api
      .actualizar({
        nombres: valores.nombres.trim(),
        apellidoPaterno: valores.apellidoPaterno.trim(),
        apellidoMaterno: this.textoOpcional(valores.apellidoMaterno),
        telefono: this.textoOpcional(valores.telefono)?.replace(/[\s-]/g, '') ?? null,
        documentoIdentidad: this.textoOpcional(valores.documentoIdentidad),
      })
      .pipe(
        finalize(() => {
          this.guardando.set(false);
          this.detector.markForCheck();
        }),
        catchError((error: HttpErrorResponse) => {
          this.manejarErrorGuardado(error);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((perfil) => {
        if (!perfil) {
          return;
        }
        this.aplicarPerfil(perfil);
        this.guardadoOk.set(true);
        this.session.actualizarNombre(this.nombreCompleto(perfil));
      });
  }

  protected crearContrasena(): void {
    if (this.guardandoContrasena()) {
      return;
    }

    this.intentoContrasena.set(true);
    this.errorContrasena.set(null);
    this.contrasenaCreada.set(false);

    if (this.formularioContrasena.invalid) {
      this.formularioContrasena.markAllAsTouched();
      return;
    }

    const valores = this.formularioContrasena.getRawValue();
    this.guardandoContrasena.set(true);
    this.api
      .crearContrasena({
        contrasena: valores.contrasena,
        confirmacion: valores.confirmarContrasena,
      })
      .pipe(
        finalize(() => {
          this.guardandoContrasena.set(false);
          this.detector.markForCheck();
        }),
        catchError((error: HttpErrorResponse) => {
          this.errorContrasena.set(
            this.obtenerErrorApi(error)?.message ?? 'No pudimos guardar la contraseña. Inténtalo nuevamente.',
          );
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado === undefined) {
          return;
        }
        this.contrasenaCreada.set(true);
        this.intentoContrasena.set(false);
        this.formularioContrasena.reset({ contrasena: '', confirmarContrasena: '' });
        const perfilActual = this.perfil();
        if (perfilActual) {
          this.perfil.set({ ...perfilActual, puedeCrearContrasena: false });
        }
      });
  }

  private aplicarPerfil(perfil: PerfilRespuesta): void {
    this.perfil.set(perfil);
    this.formulario.patchValue(
      {
        nombres: perfil.nombres,
        apellidoPaterno: perfil.apellidoPaterno,
        apellidoMaterno: perfil.apellidoMaterno ?? '',
        telefono: perfil.telefono ?? '',
        documentoIdentidad: perfil.documentoIdentidad ?? '',
      },
      { emitEvent: false },
    );
  }

  private manejarErrorGuardado(error: HttpErrorResponse): void {
    const respuesta = this.obtenerErrorApi(error);

    if (error.status === 409 && respuesta?.code === 'DUPLICATE_RESOURCE') {
      this.documentoDuplicado.set(true);
      this.formulario.controls.documentoIdentidad.setErrors({ duplicado: true });
      this.errorGuardado.set(respuesta.message ?? 'El documento ya se encuentra registrado.');
      return;
    }

    this.errorGuardado.set(
      respuesta?.message ?? 'No pudimos guardar tus datos. Revisa los campos marcados abajo.',
    );
  }

  private obtenerErrorApi(error: HttpErrorResponse): ErrorApiPerfil | null {
    if (typeof error.error !== 'object' || error.error === null) {
      return null;
    }
    return error.error as ErrorApiPerfil;
  }

  private nombreCompleto(perfil: PerfilRespuesta): string {
    const partes = [perfil.nombres, perfil.apellidoPaterno, perfil.apellidoMaterno].filter(
      (parte): parte is string => !!parte && parte.trim().length > 0,
    );
    return partes.join(' ');
  }

  private textoOpcional(valor: string): string | null {
    const limpio = valor.trim();
    return limpio.length > 0 ? limpio : null;
  }
}
