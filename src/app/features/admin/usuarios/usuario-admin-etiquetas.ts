import { CondicionCuentaAdmin, UsuarioAdminDetalle } from './usuario-admin.model';

export function etiquetaCondicion(condicion: CondicionCuentaAdmin): string {
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
export function etiquetaEstadoCuenta(usuario: Pick<UsuarioAdminDetalle, 'activo' | 'condicion'>): string {
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
export function claseEstadoCuenta(usuario: Pick<UsuarioAdminDetalle, 'activo' | 'condicion'>): string {
  if (!usuario.activo) {
    return 'badge--disp-cerrado';
  }
  return usuario.condicion === 'NINGUNA' ? 'badge--disp-inmediato' : 'badge--advertencia-suave';
}

export function etiquetaOtorgadoPor(usuario: Pick<UsuarioAdminDetalle, 'otorgadoPor'>): string {
  switch (usuario.otorgadoPor) {
    case 'ADMINISTRADOR_INICIAL':
      return 'Administrador inicial';
    case 'EQUIPO_ADMINISTRACION':
      return 'Equipo Administración';
    default:
      return 'Autoservicio';
  }
}
