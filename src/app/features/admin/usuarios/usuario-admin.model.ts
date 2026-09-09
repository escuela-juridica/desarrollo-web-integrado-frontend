export type RolUsuarioAdmin = 'ALUMNO' | 'ADMINISTRADOR';
export type OrigenUsuarioAdmin = 'FORMULARIO' | 'GOOGLE' | 'ADMINISTRATIVO';

/** CAMBIO_PENDIENTE: falta reemplazar la contraseña temporal. PENDIENTE_VERIFICACION: falta
 * verificar el correo. AMBAS_PENDIENTES: recién creada, faltan las dos. NINGUNA: cuenta operativa. */
export type CondicionCuentaAdmin =
  | 'NINGUNA'
  | 'PENDIENTE_VERIFICACION'
  | 'CAMBIO_PENDIENTE'
  | 'AMBAS_PENDIENTES';

/** Columna "Perfil concedido por" del Figma (EP02-PF-010): quién/qué otorgó la cuenta, para
 * cualquier rol — no solo administradores. */
export type OtorgadoPorAdmin = 'AUTOSERVICIO' | 'EQUIPO_ADMINISTRACION' | 'ADMINISTRADOR_INICIAL';

export interface UsuarioAdminResumen {
  usuarioId: number;
  nombreCompleto: string;
  correo: string;
  rolPrincipal: RolUsuarioAdmin;
  origenRegistro: OrigenUsuarioAdmin;
  activo: boolean;
  condicion: CondicionCuentaAdmin;
  otorgadoPor: OtorgadoPorAdmin;
}

export interface UsuarioAdminDetalle extends UsuarioAdminResumen {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  telefono: string | null;
  documentoIdentidad: string | null;
  creadoEn: string;
  /** Solo aplica a rolPrincipal === 'ADMINISTRADOR' creado desde este panel; complementa
   * `otorgadoPor` con el nombre concreto de quién le dio el rol. */
  concedidoPorNombre: string | null;
}

export interface CrearUsuarioAdminPeticion {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo: string;
  telefono: string | null;
  documentoIdentidad: string | null;
  rol: RolUsuarioAdmin;
}

export interface CrearUsuarioAdminRespuesta {
  usuario: UsuarioAdminDetalle;
  /** true si el correo ya existía: se reutilizó la cuenta y no se generó contraseña temporal. */
  reutilizada: boolean;
  contrasenaTemporal: string | null;
}

/** No incluye correo, rol ni estado: eso no se edita desde aquí (correo es la identidad de la
 * cuenta, el rol y el estado tienen sus propias acciones dedicadas). */
export interface ActualizarUsuarioAdminPeticion {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  telefono: string | null;
  documentoIdentidad: string | null;
}
