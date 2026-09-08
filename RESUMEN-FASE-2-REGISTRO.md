# Resumen de la fase 2 — Formulario reactivo de registro

## Objetivo

La fase 2 convirtió la maqueta visual de registro en un **formulario reactivo de Angular**.

Al finalizar esta fase, Angular ya puede:

- almacenar el valor de cada campo;
- conocer si un campo es válido o inválido;
- aplicar reglas de validación;
- comparar la contraseña con su confirmación;
- controlar las casillas de aceptación legal y anti-robot.

En esta fase todavía no se envían datos al backend.

---

## Archivos utilizados

| Archivo | Responsabilidad |
|---|---|
| `registro.ts` | Define el formulario y sus reglas. |
| `registro.validators.ts` | Contiene las validaciones personalizadas de contraseña. |
| `registro.html` | Conecta los campos visibles con los controles de TypeScript. |

---

## 1. Creación del formulario

En `registro.ts` usamos:

```ts
private readonly fb = inject(NonNullableFormBuilder);
```

`NonNullableFormBuilder` permite construir el formulario y evita que sus valores se conviertan inesperadamente en `null`.

El formulario se crea con:

```ts
readonly formulario = this.fb.group(
  {
    // Controles
  },
  {
    // Validadores del grupo
  },
);
```

Un `FormGroup` reúne todos los controles que pertenecen al mismo formulario.

---

## 2. Controles creados

El formulario contiene diez controles:

| Control | Tipo inicial | Obligatorio | Regla principal |
|---|---|:---:|---|
| `nombres` | `string` | Sí | Máximo 120 caracteres. |
| `apellidoPaterno` | `string` | Sí | Máximo 80 caracteres. |
| `apellidoMaterno` | `string` | No | Máximo 80 caracteres. |
| `correo` | `string` | Sí | Formato de correo y máximo 254. |
| `telefono` | `string` | No | Máximo 30 caracteres. |
| `documentoIdentidad` | `string` | No | Máximo 30 caracteres. |
| `contrasena` | `string` | Sí | Política personalizada. |
| `confirmarContrasena` | `string` | Sí | Debe coincidir con la contraseña. |
| `aceptaTerminos` | `boolean` | Sí | Debe ser `true`. |
| `antiRobot` | `boolean` | Sí | Debe ser `true` provisionalmente. |

Ejemplo de un control:

```ts
nombres: ['', [Validators.required, Validators.maxLength(120)]],
```

Esto significa:

- su valor inicial es una cadena vacía;
- no puede quedar vacío;
- no puede superar 120 caracteres.

---

## 3. Validadores utilizados

Angular proporciona validadores como:

```ts
Validators.required
Validators.requiredTrue
Validators.email
Validators.maxLength(...)
```

### `required`

Exige que un campo de texto tenga contenido.

### `requiredTrue`

Exige que una casilla tenga exactamente el valor `true`.

### `email`

Comprueba que el texto tenga formato de correo. No comprueba que la dirección exista.

### `maxLength`

Limita la cantidad máxima de caracteres aceptada por el formulario.

---

## 4. Validadores personalizados

Creamos `registro.validators.ts` porque algunas reglas necesitan lógica propia.

### Política de contraseña

```ts
politicaContrasenaValidator
```

Comprueba:

- mínimo ocho caracteres;
- una mayúscula;
- una minúscula;
- un número.

Devuelve `null` cuando la contraseña es válida o un objeto con los errores encontrados.

### Coincidencia de contraseñas

```ts
contrasenasCoincidenValidator
```

Compara:

```text
contrasena
confirmarContrasena
```

Se aplica al `FormGroup` porque necesita consultar dos controles diferentes.

---

## 5. Habilitación del formulario en el HTML

Importamos:

```ts
ReactiveFormsModule
```

y lo registramos en el componente:

```ts
imports: [RouterLink, ReactiveFormsModule],
```

Esto permite utilizar las instrucciones de formularios reactivos en la plantilla.

El contenedor visual se convirtió en un formulario real:

```html
<form class="registro-formulario" [formGroup]="formulario" novalidate>
  <!-- Campos -->
</form>
```

- `[formGroup]="formulario"` conecta el HTML con `registro.ts`.
- `novalidate` deja que Angular controle la presentación de los errores.

---

## 6. Conexión de los campos

Cada `input` utiliza `formControlName`:

```html
<input
  id="correo"
  type="email"
  formControlName="correo"
/>
```

El nombre debe coincidir exactamente con el control de TypeScript:

```ts
correo: ['', [Validators.required, Validators.email]],
```

La relación es:

```text
input del HTML
      ↓ formControlName
control del FormGroup
      ↓
valor y estado de validación
```

---

## 7. Accesibilidad básica

Cada etiqueta se relacionó con su campo mediante `for` e `id`:

```html
<label for="nombres">Nombres</label>
<input id="nombres" formControlName="nombres" />
```

Esto permite:

- seleccionar el campo al presionar su etiqueta;
- identificarlo correctamente con lectores de pantalla.

También agregamos atributos apropiados como:

```html
autocomplete="email"
autocomplete="new-password"
type="tel"
maxlength="30"
```

---

## 8. Resultado de la fase

Al terminar la fase 2:

```text
HTML visual
    ↓
10 formControlName
    ↓
10 controles del FormGroup
    ↓
Validadores de Angular y personalizados
```

La pantalla todavía no crea una cuenta. Solamente captura y valida internamente los datos.

El envío HTTP, el backend, los mensajes visuales y la navegación pertenecen a fases posteriores.

---

## Explicación corta para la exposición

> En la segunda fase transformamos la maqueta en un formulario reactivo. Definimos diez controles en TypeScript, aplicamos validadores incorporados y personalizados, y conectamos cada campo HTML mediante `formControlName`. Esto permite que Angular administre los valores y la validez del formulario antes de comunicarse con el backend.

## Pregunta probable del profesor

### ¿Por qué utilizar un formulario reactivo?

Porque centraliza los valores y validaciones en TypeScript, facilita la comparación de campos, permite mostrar errores consistentes y simplifica las pruebas unitarias.

### ¿Las validaciones del frontend son suficientes?

No. Ayudan al usuario, pero pueden ser evitadas. El backend debe repetir todas las validaciones importantes antes de guardar la cuenta.

### ¿Por qué los campos opcionales no tienen `required`?

Porque la historia permite dejarlos vacíos y su ausencia no debe bloquear la creación de la cuenta.

### ¿Por qué la coincidencia se valida en el grupo?

Porque necesita leer simultáneamente los controles `contrasena` y `confirmarContrasena`.

---

## Estado

```text
Fase 2A — Creación del FormGroup                 ✅
Fase 2B — Conexión de identidad                 ✅
Fase 2C — Conexión de contacto                  ✅
Fase 2D — Conexión de contraseñas               ✅
Fase 2E — Conexión de casillas                  ✅
```

La fase 2 está completa.
