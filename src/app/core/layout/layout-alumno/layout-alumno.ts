import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  private readonly elementRef = inject(ElementRef);

  protected readonly usuario = this.session.usuario;
  protected readonly menuCuentaAbierto = signal(false);
  protected readonly menuMovilAbierto = signal(false);

  @HostListener('document:click', ['$event'])
  protected alClicFuera(evento: MouseEvent): void {
    if (this.elementRef.nativeElement.contains(evento.target)) return;
    this.menuCuentaAbierto.set(false);
    this.menuMovilAbierto.set(false);
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
    this.cerrarMenuCuenta();
    this.session.cerrarSesion();
    this.router.navigateByUrl('/');
  }
}
