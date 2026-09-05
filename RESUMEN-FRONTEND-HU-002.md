# Frontend HU-002 — integración ajustada al backend acotado

## Actualización: documentos legales y contacto

Términos y privacidad ya muestran los textos de las maquetas, con índice desplegable y navegación por secciones. El enlace de WhatsApp está preparado y necesita el número oficial en `registro-contacto.ts`; mientras falte, no se enlaza a un destinatario inventado. Google y HU-003 siguen pendientes de coordinación.

Consulta [CIERRE-PENDIENTES-HU-002.md](CIERRE-PENDIENTES-HU-002.md) para configurar el contacto, comprobar las páginas y conocer los contratos que faltan.

## Qué se corrigió

La pantalla solicitaba `GET /api/auth/registro/config` al abrirse. Esa ruta se había retirado del backend y, por eso, aparecía un error de conexión antes de enviar el formulario.

Ahora no se solicita esa ruta. Tampoco se inician solicitudes a los endpoints retirados de acceso Google, consulta de sesión o cierre de sesión. Se retiraron los componentes específicos de Google Identity Services y Turnstile de la implementación anterior.

Se conservaron el diseño, los campos, sus validaciones, enlaces legales, normalización, errores por campo y prevención del doble envío.

## Qué verás al abrir /registro

- El formulario se abre sin el error rojo causado por la configuración retirada.
- El botón Google aparece deshabilitado con una explicación: falta integrarlo con el módulo de acceso.
- Cerca del botón de registro aparece la comprobación matemática nativa, identificada como demostración académica.
- Puedes completar y revisar los campos.
- Crear cuenta permanece deshabilitado mientras no exista evidencia anti-robot.
- No se incluye una casilla ficticia, un token de prueba ni una excepción que permita saltarse la protección.

El desafío nativo ya permite enviar el registro tradicional al backend. Para crear una cuenta, el backend debe estar iniciado y tener disponibles su base de datos y el rol alumno. Google sigue pendiente. La suma no constituye protección robusta contra bots.

## Qué llamadas se conservan

| Operación | Solicitud |
| --- | --- |
| Crear cuenta tradicional, cuando exista evidencia real | `POST /api/auth/registro` |
| Recibir contexto desde una referencia de HU-001 | `GET /api/auth/registro/google/{referencia}` |
| Completar ese contexto Google | `POST /api/auth/registro/google` |
| Solicitar desafío propio | `POST /api/auth/registro/antirobot/desafios` |
| Validar respuesta y obtener evidencia | `POST /api/auth/registro/antirobot/verificar` |

La página admite `/registro?referenciaGoogle=...`. La referencia solo identifica el contexto que debe validar el backend; Angular no declara que una identidad Google sea válida por su cuenta.

Si el backend responde `503 GOOGLE_PENDIENTE`, se muestra un aviso de integración pendiente y no se habilita la finalización. Si responde con una referencia inválida o vencida, se informa el error y se permite volver al formulario, sin simular una nueva autorización Google.

## Qué se mantiene preparado

- Campos obligatorios, opcionales y aceptación legal.
- Evidencia anti-robot obligatoria, obtenida mediante el componente `AntiRobot` y validada por el servidor.
- Normalización de textos y correo; opcionales vacíos enviados como `null`.
- Contraseñas sin recortar.
- POST tradicional y navegación hacia HU-003 con la referencia recibida.
- POST Google sin correo ni subject en el cuerpo.
- Datos de presentación de sesión después de completar Google.
- Conservación de datos ante errores.

Las pruebas de Angular simulan HTTP; el backend tiene además un recorrido con el desafío nativo real y persistencia H2 aislada. No se usan claves ni proveedores externos.

## Sesión compartida: límite explícito

Se eliminó la consulta automática a `/api/auth/sesion`, porque el backend acotado no la implementa. La restauración tras recargar debe integrarse con el servicio de acceso del equipo.

El botón Cerrar sesión ya no llama a `/api/auth/cierre`. Informa que falta esa integración y no borra únicamente el estado de Angular: hacerlo no eliminaría la cookie HttpOnly y simularía un cierre que no ocurrió. No se implementó un reemplazo de HU-001.

## Cómo comprobar este ajuste

1. Reinicia el backend y mantén Angular ejecutándose con `npm start`.
2. Recarga `http://localhost:4200/registro`.
3. Comprueba que no aparezca el error de conexión inicial.
4. Abre Red / Network: no debe haber solicitudes a `/registro/config` ni a `/auth/sesion`.
5. Pulsa «No soy robot», responde la suma y pulsa «Comprobar respuesta». No debe poder enviarse el registro antes de recibir evidencia.
6. No intentes completar esta dependencia escribiendo un token manual ni modificando la base.

Comandos de comprobación:

```bash
npm run build
npm test -- --watch=false --include='src/app/features/auth/registro/**/*.spec.ts' --include='src/app/core/session/*.spec.ts' --include='src/app/core/layout/layout-alumno/*.spec.ts'
```

Las pruebas incluyen apertura sin solicitudes HTTP, recepción de contexto HU-001, respuesta de integración pendiente, bloqueo sin evidencia y conservación de datos. Las pruebas antiguas ajenas a este alcance no se modificaron.

## Qué debe acordar el equipo antes de activar cuentas

1. La aceptación del desafío académico para la exposición y la protección necesaria antes de publicar.
2. El origen y contrato de la referencia Google de HU-001.
3. La consulta y cierre de sesión compartidos.
4. La continuación y verificación de código de HU-003.

No hace falta compartir claves ni contraseñas para acordar estos contratos.

Detalles del servidor: [GUIA-BACKEND-HU-002.md](../desarrollo-web-integrado-backend/GUIA-BACKEND-HU-002.md).

Paso a paso y explicación del código nuevo: [GUIA-ANTIROBOT-NATIVO.md](../desarrollo-web-integrado-backend/GUIA-ANTIROBOT-NATIVO.md).

Las guías antiguas por fases describen el desarrollo histórico; este resumen sustituye sus instrucciones sobre los proveedores y rutas retirados.

Respaldo local anterior a este ajuste: `/tmp/hu002-frontend-respaldo-g36NtS/frontend-antes-del-ajuste.tar.gz`. Permite recuperar los archivos retirados; al estar en una carpeta temporal no es un respaldo permanente.
