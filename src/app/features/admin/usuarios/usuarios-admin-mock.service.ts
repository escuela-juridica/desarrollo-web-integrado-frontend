import { Injectable, computed, inject, signal } from '@angular/core';

import { Session } from '../../../core/session/session';
import {
  ActualizarUsuarioAdminPeticion,
  CondicionCuentaAdmin,
  CrearUsuarioAdminPeticion,
  CrearUsuarioAdminRespuesta,
  RolUsuarioAdmin,
  UsuarioAdminDetalle,
} from './usuario-admin.model';

/**
 * ⚠️ NO ES LA VERSIÓN FINAL. HU-008 todavía no tiene backend (no existe mapa técnico ni
 * `/api/admin/usuarios`): esto es un almacén en memoria que simula búsqueda, creación,
 * edición y habilitación/deshabilitación solo para que el CRUD sea demostrable desde Angular
 * mientras se define e implementa la HU-008 real en el servidor. Se pierde al recargar la página.
 *
 * Cuando exista el backend, reemplazar este servicio por uno que use HttpClient contra los
 * endpoints reales, conservando la misma interfaz pública (listar/obtener/crear/actualizar/
 * cambiarEstado) para no tener que tocar los componentes que lo consumen.
 */
@Injectable({ providedIn: 'root' })
export class UsuariosAdminMockService {
  private readonly session = inject(Session);

  private readonly usuarios = signal<UsuarioAdminDetalle[]>([
    {
      usuarioId: 1,
      nombres: 'ADMINISTRADOR',
      apellidoPaterno: 'GENERAL',
      apellidoMaterno: null,
      nombreCompleto: 'ADMINISTRADOR GENERAL',
      correo: 'admin@escuelajuridica.edu.pe',
      telefono: null,
      documentoIdentidad: null,
      rolPrincipal: 'ADMINISTRADOR',
      origenRegistro: 'ADMINISTRATIVO',
      activo: true,
      condicion: 'NINGUNA',
      otorgadoPor: 'ADMINISTRADOR_INICIAL',
      creadoEn: '2026-01-15T09:00:00-05:00',
      concedidoPorNombre: null,
    },
    {
      usuarioId: 12,
      nombres: 'JASON',
      apellidoPaterno: 'DUVAL',
      apellidoMaterno: null,
      nombreCompleto: 'JASON DUVAL',
      correo: 'jason.duval@esejur.pe',
      telefono: null,
      documentoIdentidad: null,
      rolPrincipal: 'ADMINISTRADOR',
      origenRegistro: 'ADMINISTRATIVO',
      activo: true,
      condicion: 'AMBAS_PENDIENTES',
      otorgadoPor: 'EQUIPO_ADMINISTRACION',
      creadoEn: '2026-09-01T10:15:00-05:00',
      concedidoPorNombre: 'ADMINISTRADOR GENERAL',
    },
    {
      usuarioId: 21,
      nombres: 'LUCIA',
      apellidoPaterno: 'CAMINOS',
      apellidoMaterno: 'QUIROZ',
      nombreCompleto: 'LUCIA CAMINOS QUIROZ',
      correo: 'lucia.caminos@example.com',
      telefono: '987654321',
      documentoIdentidad: '48123456',
      rolPrincipal: 'ALUMNO',
      origenRegistro: 'GOOGLE',
      activo: false,
      condicion: 'NINGUNA',
      otorgadoPor: 'AUTOSERVICIO',
      creadoEn: '2026-05-10T08:00:00-05:00',
      concedidoPorNombre: null,
    },
  ]);

  private readonly siguienteId = signal(100);

  protected readonly administradoresActivos = computed(
    () =>
      this.usuarios().filter((u) => u.rolPrincipal === 'ADMINISTRADOR' && u.activo).length,
  );

  listar(busqueda: string, rol: RolUsuarioAdmin | 'TODOS' = 'TODOS'): UsuarioAdminDetalle[] {
    const termino = busqueda.trim().toLowerCase();
    return this.usuarios().filter((u) => {
      const coincideRol = rol === 'TODOS' || u.rolPrincipal === rol;
      const coincideTermino =
        !termino ||
        u.nombreCompleto.toLowerCase().includes(termino) ||
        u.correo.toLowerCase().includes(termino);
      return coincideRol && coincideTermino;
    });
  }

  obtener(usuarioId: number): UsuarioAdminDetalle | null {
    return this.usuarios().find((u) => u.usuarioId === usuarioId) ?? null;
  }

  crear(peticion: CrearUsuarioAdminPeticion): CrearUsuarioAdminRespuesta {
    const correoNormalizado = peticion.correo.trim().toLowerCase();
    const existente = this.usuarios().find(
      (u) => u.correo.toLowerCase() === correoNormalizado,
    );

    if (existente) {
      return { usuario: existente, reutilizada: true, contrasenaTemporal: null };
    }

    const id = this.siguienteId();
    this.siguienteId.set(id + 1);
    const nombreCompleto = [peticion.nombres, peticion.apellidoPaterno, peticion.apellidoMaterno]
      .filter((parte): parte is string => !!parte)
      .join(' ');

    const nuevo: UsuarioAdminDetalle = {
      usuarioId: id,
      nombres: peticion.nombres,
      apellidoPaterno: peticion.apellidoPaterno,
      apellidoMaterno: peticion.apellidoMaterno,
      nombreCompleto,
      correo: correoNormalizado,
      telefono: peticion.telefono,
      documentoIdentidad: peticion.documentoIdentidad,
      rolPrincipal: peticion.rol,
      origenRegistro: 'ADMINISTRATIVO',
      activo: true,
      condicion: 'AMBAS_PENDIENTES',
      otorgadoPor: 'EQUIPO_ADMINISTRACION',
      creadoEn: new Date().toISOString(),
      concedidoPorNombre:
        peticion.rol === 'ADMINISTRADOR' ? (this.session.usuario()?.nombreCompleto ?? null) : null,
    };

    this.usuarios.update((lista) => [nuevo, ...lista]);
    return { usuario: nuevo, reutilizada: false, contrasenaTemporal: 'Escuela1415@' };
  }

  /** Devuelve un mensaje de error si la operación no se permite; null si se aplicó. */
  cambiarEstado(usuarioId: number, activo: boolean): string | null {
    const objetivo = this.obtener(usuarioId);
    if (!objetivo) {
      return 'La cuenta ya no existe.';
    }

    if (!activo) {
      if (objetivo.usuarioId === this.session.usuario()?.usuarioId) {
        return 'No puedes desactivar tu propia cuenta.';
      }
      if (
        objetivo.rolPrincipal === 'ADMINISTRADOR' &&
        objetivo.activo &&
        this.administradoresActivos() <= 1
      ) {
        return 'No puedes desactivar al último administrador habilitado.';
      }
    }

    this.usuarios.update((lista) =>
      lista.map((u) => (u.usuarioId === usuarioId ? { ...u, activo } : u)),
    );
    return null;
  }

  /**
   * Borrado permanente, sin recuperación. Ojo: HU-008 dice explícitamente que una cuenta "se
   * deshabilita para impedir nuevos accesos, pero no se elimina ni pierde matrículas, pagos,
   * progreso, intentos, certificados o historial relacionados" — esto va contra esa regla y solo
   * existe porque se pidió explícitamente. Si algún día hay backend real con esas relaciones, un
   * DELETE real las rompería o exigiría borrado en cascada; acá no pasa nada porque este servicio
   * no tiene esas tablas. Aplica las mismas protecciones que `cambiarEstado`.
   */
  eliminar(usuarioId: number): string | null {
    const objetivo = this.obtener(usuarioId);
    if (!objetivo) {
      return 'La cuenta ya no existe.';
    }
    if (objetivo.usuarioId === this.session.usuario()?.usuarioId) {
      return 'No puedes eliminar tu propia cuenta.';
    }
    if (
      objetivo.rolPrincipal === 'ADMINISTRADOR' &&
      objetivo.activo &&
      this.administradoresActivos() <= 1
    ) {
      return 'No puedes eliminar al último administrador habilitado.';
    }

    this.usuarios.update((lista) => lista.filter((u) => u.usuarioId !== usuarioId));
    return null;
  }

  /** No toca correo, rol ni estado. Devuelve un mensaje de error si el documento ya está en uso
   * por otra cuenta; null si se aplicó. */
  actualizar(usuarioId: number, peticion: ActualizarUsuarioAdminPeticion): string | null {
    const objetivo = this.obtener(usuarioId);
    if (!objetivo) {
      return 'La cuenta ya no existe.';
    }

    if (
      peticion.documentoIdentidad &&
      this.usuarios().some(
        (u) => u.usuarioId !== usuarioId && u.documentoIdentidad === peticion.documentoIdentidad,
      )
    ) {
      return 'Ese documento ya está registrado en otra cuenta.';
    }

    const nombreCompleto = [peticion.nombres, peticion.apellidoPaterno, peticion.apellidoMaterno]
      .filter((parte): parte is string => !!parte)
      .join(' ');

    this.usuarios.update((lista) =>
      lista.map((u) =>
        u.usuarioId === usuarioId
          ? {
              ...u,
              nombres: peticion.nombres,
              apellidoPaterno: peticion.apellidoPaterno,
              apellidoMaterno: peticion.apellidoMaterno,
              telefono: peticion.telefono,
              documentoIdentidad: peticion.documentoIdentidad,
              nombreCompleto,
            }
          : u,
      ),
    );
    return null;
  }

  etiquetaCondicion(condicion: CondicionCuentaAdmin): string {
    switch (condicion) {
      case 'AMBAS_PENDIENTES':
        return 'Verificación y contraseña pendientes';
      case 'PENDIENTE_VERIFICACION':
        return 'Verificación de correo pendiente';
      case 'CAMBIO_PENDIENTE':
        return 'Cambio de contraseña pendiente';
      default:
        return '';
    }
  }

  /** Un solo rótulo por fila, como en el Figma (EP02-PF-010): "Habilitada" / "Deshabilitada" /
   * "Contraseña temporal" / "Correo sin verificar". Si faltan las dos, prioriza la contraseña
   * porque es lo primero que la persona debe resolver al entrar con la clave temporal. */
  etiquetaEstadoCuenta(usuario: Pick<UsuarioAdminDetalle, 'activo' | 'condicion'>): string {
    if (!usuario.activo) {
      return 'Deshabilitada';
    }
    if (usuario.condicion === 'CAMBIO_PENDIENTE' || usuario.condicion === 'AMBAS_PENDIENTES') {
      return 'Contraseña temporal';
    }
    if (usuario.condicion === 'PENDIENTE_VERIFICACION') {
      return 'Correo sin verificar';
    }
    return 'Habilitada';
  }

  /** Clase de color para acompañar `etiquetaEstadoCuenta`. */
  claseEstadoCuenta(usuario: Pick<UsuarioAdminDetalle, 'activo' | 'condicion'>): string {
    if (!usuario.activo) {
      return 'badge--disp-cerrado';
    }
    return usuario.condicion === 'NINGUNA' ? 'badge--disp-inmediato' : 'badge--advertencia-suave';
  }

  etiquetaOtorgadoPor(usuario: Pick<UsuarioAdminDetalle, 'otorgadoPor'>): string {
    switch (usuario.otorgadoPor) {
      case 'ADMINISTRADOR_INICIAL':
        return 'Administrador inicial';
      case 'EQUIPO_ADMINISTRACION':
        return 'Equipo Administración';
      default:
        return 'Autoservicio';
    }
  }
}
