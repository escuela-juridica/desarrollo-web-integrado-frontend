import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { obtenerIniciales } from '../../session/nombre-utils';
import { Session } from '../../session/session';

/**
 * Sidebar según el prototipo real de HU-008 (Figma: EP02-PF-010-HU-008-Gestión de usuarios).
 * ⚠️ Solo "Usuarios" está construido; el resto de secciones del mockup se listan deshabilitadas
 * porque pertenecen a otras historias todavía no implementadas. El menú de cuenta al pie del
 * sidebar no aparece en el mockup (ahí no se ve ese estado) — se agregó porque hace falta alguna
 * forma de cerrar sesión.
 */
@Component({
  selector: 'app-layout-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.scss',
})
export class LayoutAdmin {
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  protected readonly usuario = this.session.usuario;
  protected readonly menuCuentaAbierto = signal(false);

  private readonly cuentaMenuRef = viewChild<ElementRef<HTMLElement>>('cuentaMenu');

  protected get iniciales(): string {
    return obtenerIniciales(this.usuario()?.nombreCompleto) || 'AD';
  }

  /** Antes comparaba contra el host de todo el layout (sidebar + contenido), así que casi
   * cualquier clic en la página contaba como "adentro" y el menú nunca se cerraba solo. */
  @HostListener('document:click', ['$event'])
  protected alClicFuera(evento: MouseEvent): void {
    if (this.cuentaMenuRef()?.nativeElement.contains(evento.target as Node)) return;
    this.menuCuentaAbierto.set(false);
  }

  protected toggleMenuCuenta(): void {
    this.menuCuentaAbierto.update((abierto) => !abierto);
  }

  cerrarSesion(): void {
    this.session.cerrarSesion().subscribe(() => {
      void this.router.navigate(['/catalogo']);
    });
  }
}
