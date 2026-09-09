import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { obtenerIniciales } from '../../session/nombre-utils';
import { Session } from '../../session/session';

@Component({
  selector: 'app-layout-alumno',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-alumno.html',
  styleUrl: './layout-alumno.scss',
})
export class LayoutAlumno {
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  protected readonly usuario = this.session.usuario;
  protected readonly menuCuentaAbierto = signal(false);
  protected readonly menuMovilAbierto = signal(false);
  protected readonly errorSesion = signal('');

  private readonly cuentaMenuRef = viewChild<ElementRef<HTMLElement>>('cuentaMenu');
  private readonly movilBotonRef = viewChild<ElementRef<HTMLElement>>('movilBoton');
  private readonly movilPanelRef = viewChild<ElementRef<HTMLElement>>('movilPanel');

  protected get iniciales(): string {
    return obtenerIniciales(this.usuario()?.nombreCompleto) || 'LC';
  }

  /** Antes comparaba contra el host de todo el layout (header + contenido), así que casi
   * cualquier clic en la página contaba como "adentro" y el menú nunca se cerraba solo. Ahora
   * cada menú compara solo contra su propio contenedor. */
  @HostListener('document:click', ['$event'])
  protected alClicFuera(evento: MouseEvent): void {
    const objetivo = evento.target as Node;

    if (!this.cuentaMenuRef()?.nativeElement.contains(objetivo)) {
      this.menuCuentaAbierto.set(false);
    }

    const dentroDeMovil =
      this.movilBotonRef()?.nativeElement.contains(objetivo) ||
      this.movilPanelRef()?.nativeElement.contains(objetivo);
    if (!dentroDeMovil) {
      this.menuMovilAbierto.set(false);
    }
  }

  protected toggleMenuCuenta(): void {
    this.menuCuentaAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenuCuenta(): void {
    this.menuCuentaAbierto.set(false);
  }

  protected toggleMenuMovil(): void {
    this.menuMovilAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenuMovil(): void {
    this.menuMovilAbierto.set(false);
  }

  cerrarSesion(): void {
    this.session.cerrarSesion().subscribe(() => {
      void this.router.navigate(['/catalogo']);
    });
  }
}
