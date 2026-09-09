import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminUsuariosApiService } from '../admin-usuarios-api.service';
import { RolUsuarioAdmin, UsuarioAdminDetalle } from '../usuario-admin.model';
import { claseEstadoCuenta, etiquetaEstadoCuenta, etiquetaOtorgadoPor } from '../usuario-admin-etiquetas';

/** ⚠️ NO ES LA VERSIÓN FINAL: consulta `/api/admin/usuarios`, una API REST real pero sin base de
 * datos. Ver el comentario de AdminUsuariosApiService.
 * Diseño según el Figma EP02-PF-010-HU-008-Gestión de usuarios. */
@Component({
  selector: 'app-usuarios-listado',
  imports: [FormsModule, RouterLink],
  templateUrl: './usuarios-listado.html',
  styleUrl: './usuarios-listado.scss',
})
export class UsuariosListado implements OnInit {
  private readonly api = inject(AdminUsuariosApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly detector = inject(ChangeDetectorRef);

  protected readonly busqueda = signal('');
  protected readonly filtroRol = signal<RolUsuarioAdmin | 'TODOS'>('TODOS');
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly usuarios = signal<UsuarioAdminDetalle[]>([]);

  protected readonly etiquetaEstadoCuenta = etiquetaEstadoCuenta;
  protected readonly claseEstadoCuenta = claseEstadoCuenta;
  protected readonly etiquetaOtorgadoPor = etiquetaOtorgadoPor;

  ngOnInit(): void {
    this.cargar();
  }

  protected onBusquedaInput(valor: string): void {
    this.busqueda.set(valor);
    this.cargar();
  }

  protected onFiltroRolChange(valor: string): void {
    this.filtroRol.set(valor as RolUsuarioAdmin | 'TODOS');
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api
      .listar(this.busqueda(), this.filtroRol())
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          this.detector.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios),
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 403
              ? 'No tienes permiso para ver esta información.'
              : 'No pudimos cargar los usuarios. Inténtalo nuevamente.',
          );
        },
      });
  }
}
