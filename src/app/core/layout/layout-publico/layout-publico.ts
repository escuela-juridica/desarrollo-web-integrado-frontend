import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterPublico } from '../footer-publico/footer-publico';
import { obtenerIniciales } from '../../session/nombre-utils';
import { Session } from '../../session/session';

@Component({
  selector: 'app-layout-publico',
  imports: [RouterOutlet, RouterLink, FooterPublico],
  templateUrl: './layout-publico.html',
  styleUrl: './layout-publico.scss',
})
export class LayoutPublico {
  private readonly session = inject(Session);

  protected readonly usuario = this.session.usuario;
  protected readonly estaAutenticado = this.session.estaAutenticado;
  protected readonly menuCuentaAbierto = signal(false);

  private readonly cuentaMenuRef = viewChild<ElementRef<HTMLElement>>('cuentaMenu');

  protected get iniciales(): string {
    return obtenerIniciales(this.usuario()?.nombreCompleto);
  }

  /** Antes comparaba contra el host de todo el layout (header + contenido), así que casi
   * cualquier clic en la página contaba como "adentro" y el menú nunca se cerraba solo. */
  @HostListener('document:click', ['$event'])
  protected alClicFuera(evento: MouseEvent): void {
    if (this.cuentaMenuRef()?.nativeElement.contains(evento.target as Node)) return;
    this.menuCuentaAbierto.set(false);
  }

  protected toggleMenuCuenta(): void {
    this.menuCuentaAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenuCuenta(): void {
    this.menuCuentaAbierto.set(false);
  }

  protected cerrarSesion(): void {
    this.session.cerrarSesion().subscribe(() => this.cerrarMenuCuenta());
  }
}
