# HU-002: pendientes completados y coordinación restante

**Acuerdo actual:** el número de WhatsApp se añadirá después de la entrega. HU-001 y HU-003 los están desarrollando los compañeros y se integrarán cuando sus PR estén disponibles. Este ajuste prepara HU-002 sin reemplazar esos módulos. Un merge no garantiza integración automática si los contratos difieren.

## 1. Qué se terminó en este ajuste

### Términos y privacidad

Las rutas `/terminos` y `/privacidad` ahora muestran los documentos de las maquetas `HU-002-PF-011b-terminos.html` y `HU-002-PF-011a-privacidad.html`, respectivamente.

- Se trasladó exclusivamente el contenido de lectura; el encabezado y pie siguen siendo los componentes públicos compartidos.
- Se conservaron los textos y fechas de las maquetas. No se redactaron políticas nuevas ni se certificó su adecuación legal.
- Los enlaces usan `routerLink` y `fragment`: navegan por Angular y permiten ir a las cinco secciones de cada documento.
- El índice usa `<details open>` y `<summary>`: empieza desplegado y permite plegarlo mediante ratón o teclado.
- Los enlaces desde el registro conservan `target="_blank"` y `rel="noopener"`: el documento se abre en otra pestaña y el formulario original permanece abierto.
- Los estilos propios se encuentran en el `.scss` de cada pantalla. No se modificaron los estilos globales.

Los textos proceden del material del proyecto; antes de una publicación real, el equipo debe confirmar que reflejan el funcionamiento y la política institucional. Por ejemplo, la maqueta de privacidad menciona avisos operativos con datos opcionales, mientras la historia especifica que las notificaciones automáticas son por correo. No se resolvió esa posible ambigüedad cambiando unilateralmente el contenido.

### Ayuda por WhatsApp

Se preparó un enlace configurable que abre el chat con un mensaje de ayuda, sin adjuntar nombres, correos, contraseñas ni otros datos del formulario. No envía el mensaje automáticamente ni crea una cuenta o matrícula.

**Falta el número oficial.** No se encontró uno configurado en el repositorio. Mientras esté vacío o tenga un formato inválido, no se genera un enlace y se muestra «WhatsApp pendiente de configurar».

Para activarlo:

1. Confirma el número oficial con el equipo, incluido su código de país.
2. Abre `src/app/features/auth/registro/registro-contacto.ts`.
3. En `NUMERO_WHATSAPP_REGISTRO`, sustituye la cadena vacía por ese número, solo con dígitos: sin `+`, espacios ni guiones.
4. Guarda y recarga `/registro`. Debe aparecer «Escríbenos por WhatsApp».
5. Comprueba que abre el destinatario correcto. No es necesario enviar un mensaje para revisar el enlace.

`InjectionToken` permite sustituir la configuración en pruebas sin alterar el número real. El número ficticio que aparece en las pruebas no se usa en la aplicación ni se contacta.

## 2. Pruebas y comprobación manual

Desde la carpeta frontend:

```bash
npm run build
npm run test:hu002
```

Lista manual:

1. Abre `/registro` y escribe un nombre sin enviar el formulario.
2. Abre los términos desde la casilla legal. Revisa título, texto y sus cinco secciones.
3. Pliega y despliega el índice; navega a una sección y verifica que se ve su encabezado.
4. Sigue el enlace a privacidad y repite la comprobación.
5. Vuelve a la pestaña original: el nombre debe seguir escrito.
6. Comprueba que sin número oficial WhatsApp no apunta a un destinatario inventado.
7. Una vez configurado, revisa el enlace sin enviar mensajes ni crear cuentas.

Se verificaron por comparación automática los párrafos, encabezados y fechas contra las maquetas. Las pruebas comprueban contenido, rutas, índice, apertura de documentos en otra pestaña y comportamiento de WhatsApp con y sin configuración. No hubo un navegador de automatización disponible para una inspección visual; queda esa comprobación manual.

`test:hu002` es un comando adicional en `package.json`; no reemplaza `npm test` ni cambia las pruebas de los compañeros. Incluye pruebas HTTP con respuestas simuladas de Google y de registro con fallo SMTP para proteger los contratos actuales al integrar. No constituye una prueba de Google real ni de SMTP real.

## 3. Qué falta recibir de HU-001 (Google)

No se encontró una implementación real que resuelva `ContextoGoogleRegistro`. Por eso el botón Google continúa deshabilitado y el backend responde `GOOGLE_PENDIENTE` cuando se intenta obtener ese contexto.

Antes de conectar debemos recibir del responsable:

- El código o contrato real que inicia Google desde registro/acceso y retorna una referencia temporal.
- Cómo comprobar autenticidad, vigencia y cancelación de esa referencia en el servidor.
- Cómo resolver cuentas existentes y vincular accesos sin duplicarlas ni confiar únicamente en un correo enviado por el navegador.
- Cómo se comparte la sesión y se continúa al panel.

HU-002 ya tiene estas operaciones:

| Operación existente | Función |
| --- | --- |
| `GET /api/auth/registro/google/{referencia}` | Solicitar datos autorizados del contexto. |
| `POST /api/auth/registro/google` | Completar una cuenta nueva con la identidad validada. |
| `ContextoGoogleRegistro.obtenerVerificada(referencia)` | Punto interno de adaptación: entrega `subject`, `correo`, `nombres`, `apellidos`, `fotoUrl` y `venceEn`. |

Estos nombres son la implementación actual de HU-002, no un contrato impuesto a tus compañeros. Si HU-001 utiliza otro contrato, debemos adaptarnos de forma acordada. No se añadieron rutas OAuth, credenciales, identidades simuladas ni cambios a la seguridad global para ocultar esta dependencia.

## 4. Qué falta coordinar con HU-003 (verificación de correo)

El registro tradicional ya devuelve `usuarioId`, `correo`, `envioAceptado` y `referenciaVerificacion`. Angular navega a `/verificar-correo?referencia=...` y pasa `correo` y `envioAceptado` en el estado de navegación.

La referencia actual es el identificador de cuenta convertido a texto: **no verifica el correo ni autoriza iniciar sesión**. El código de seis dígitos nunca se incluye en la URL ni en la respuesta de registro.

El responsable de HU-003 debe confirmar cómo recibe esa referencia, comprueba el código y permite el reenvío, incluido el caso `envioAceptado=false`. Debe contemplar entrada directa o ausencia de estado de navegación; no confiar en datos manipulables del navegador para habilitar una cuenta.

Su pantalla sigue siendo un marcador pendiente. No se reemplazó su módulo ni se inventaron sus endpoints en este ajuste. `CodigoVerificacionServicio` ya está preparado para reutilizarse dentro de una transacción.

## 5. Qué impide declarar terminada toda HU-002

1. El número oficial para activar WhatsApp.
2. La integración Google real y el acuerdo de vinculación con HU-001.
3. La continuidad de verificación y reenvío con HU-003.
4. La decisión del equipo/profesor sobre la suma anti-robot: es una demostración académica, no una defensa robusta.
5. La demostración final con datos de prueba y correo acordados por el equipo. Las pruebas aisladas no demuestran por sí solas que PostgreSQL y SMTP reales funcionen conjuntamente.

No se modificó el backend, no se escribieron datos en la base compartida y no se enviaron correos ni mensajes de WhatsApp durante este ajuste.

## 6. Lista de integración cuando estén disponibles los PR

### Preparar el merge

- Revisar las diferencias antes de combinar, especialmente `app.routes.ts`, `app.config.ts`, `core/session/session.ts`, los layouts y las configuraciones compartidas del backend.
- No sustituir estos archivos completos por una versión de otra rama: conservar y reconciliar los cambios de ambos módulos.
- No duplicar las entidades `Persona`, `Usuario`, `Rol` y `UsuarioRol`, el codificador de contraseña ni los servicios compartidos de correo y sesión.
- No subir contraseñas, secretos, tokens ni respaldos locales. Revisar los cambios preparados para el commit sin publicar las propiedades sensibles.

### Conectar HU-001

1. Acordar su ruta de inicio Google antes de habilitar el botón de PF-004. No inventar una URL en el frontend.
2. Hacer que el flujo de correo nuevo termine en `/registro?referenciaGoogle=...`, o adaptar explícitamente ambos módulos a la ruta acordada.
3. Conectar una única implementación confiable de `ContextoGoogleRegistro`, o adaptar HU-002 al contrato existente del compañero. Registrar dos adaptadores simultáneos produce ambigüedad y debe evitarse.
4. Conservar en el GET los campos actuales: `correo`, `nombres`, `apellidos`, `fotoUrl`, `venceEn` (fecha ISO). Los apellidos pueden llegar en bloque; no se obliga a separarlos.
5. El POST de finalización envía `referencia`, datos personales necesarios y `aceptaTerminos`; no envía correo, subject ni contraseña. El servidor obtiene la identidad del contexto comprobado.
6. La respuesta de sesión actual contiene `nombre`, `email` y `rol: "alumno"`, además de la cookie HttpOnly emitida por el backend. Angular guarda los datos de presentación y navega a `/app/panel`. Acordar cualquier cambio de ese contrato y la restauración al recargar con HU-001.
7. Probar Google nuevo, cancelación, referencia alterada/vencida y correo existente. La vinculación debe usar la identidad verificada y la política acordada, nunca solo un correo escrito por el visitante.

### Conectar HU-003

1. Leer el parámetro `referencia` de `/verificar-correo` y acordar su validación con el backend.
2. Tratar el estado `envioAceptado=false` como cuenta ya creada pendiente de reenvío, no volver a llamar a `POST /api/auth/registro`.
3. Confirmar las rutas y reglas reales de comprobar/reemitir códigos. HU-002 no presupone sus endpoints.
4. Probar correo aceptado, fallo SMTP, reenvío y entrada directa o recarga sin estado de navegación.

### Verificar antes de darlo por terminado

- Backend: `bash mvnw test` en su carpeta, con las pruebas aisladas del repositorio.
- Frontend: `npm run test:hu002` y `npm run build`.
- Ejecutar también las pruebas propias de HU-001/HU-003 y revisar los fallos de la suite general, no solo las de HU-002.
- Con datos y destinatario acordados, demostrar registro tradicional pendiente, Google habilitado sin código adicional y rechazo de duplicados sin perder historial.

Esta lista documenta qué falta conectar; no afirma que esas integraciones ya existan ni que los PR se hayan publicado o fusionado.
