import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RolUsuarioAdmin } from '../usuario-admin.model';
import { UsuariosAdminMockService } from '../usuarios-admin-mock.service';

/** ⚠️ NO ES LA VERSIÓN FINAL: lista contra UsuariosAdminMockService (datos en memoria), no contra
 * un backend real. Ver el comentario de ese servicio para más contexto.
 * Diseño según el Figma EP02-PF-010-HU-008-Gestión de usuarios. */
@Component({
  selector: 'app-usuarios-listado',
  imports: [FormsModule, RouterLink],
  templateUrl: './usuarios-listado.html',
  styleUrl: './usuarios-listado.scss',
})
export class UsuariosListado {
  protected readonly servicio = inject(UsuariosAdminMockService);

  protected readonly busqueda = signal('');
  protected readonly filtroRol = signal<RolUsuarioAdmin | 'TODOS'>('TODOS');
  protected readonly usuarios = computed(() =>
    this.servicio.listar(this.busqueda(), this.filtroRol()),
  );

  protected onBusquedaInput(valor: string): void {
    this.busqueda.set(valor);
  }

  protected onFiltroRolChange(valor: string): void {
    this.filtroRol.set(valor as RolUsuarioAdmin | 'TODOS');
  }
}
