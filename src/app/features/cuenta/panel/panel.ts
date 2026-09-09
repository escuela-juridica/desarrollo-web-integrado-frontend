import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Session } from '../../../core/session/session';

interface CursoActivo {
  id: number;
  imagenUrl: string;
  tipo: string;
  categoria: string;
  nombre: string;
  porcentajeProgreso: number;
  leccionesCompletadas: number;
  totalLecciones: number;
  siguienteLeccionNombre: string;
}

@Component({
  selector: 'app-panel',
  imports: [RouterLink],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel {
  private readonly session = inject(Session);

  readonly usuario = this.session.usuario;
  readonly cursosActivos: CursoActivo[] = [];
}
