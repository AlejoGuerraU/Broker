# Depuración inicial del modelo de base de datos

Este documento resume los hallazgos al comparar:

- La imagen del modelo entidad-relación en `RecursosAdicionales`
- Las reglas de negocio del archivo `ReglasDeNegocio.txt.txt`
- El estado actual del proyecto descrito en `README.md`

## 1. Hallazgos principales

### 1. Regla 1 vs estructura de cuentas

La regla 1 dice que una persona solo puede tener una cuenta, pero el modelo muestra:

- `tbl_cuenta_gestor`
- `tbl_cuenta_broker`

Además, la regla 3 dice que ambas cuentas se crean automáticamente al primer ingreso.

Depuración recomendada:

- Cambiar la interpretación de la regla 1 a: una persona solo puede tener un perfil único en la aplicación.
- Mantener una relación 1:1 entre `tbl_persona` y `tbl_cuenta_gestor`.
- Mantener una relación 1:1 entre `tbl_persona` y `tbl_cuenta_broker`.
- Agregar restricción `UNIQUE` sobre `id_persona` en ambas tablas de cuenta.

### 2. La cuenta del bróker parece ser demo, pero el modelo no lo expresa

Las reglas hablan explícitamente de una cuenta demo del bróker, pero `tbl_cuenta_broker` no indica si la cuenta es demo o real.

Depuración recomendada:

- Si por ahora solo existirá la cuenta demo, dejarlo documentado en el nombre lógico o en la documentación.
- Si luego habrá cuentas reales, agregar un campo `tipo_cuenta` con valores como `demo` y `real`.

### 3. La regla de mercado cerrado necesita estados y fechas más claros

La regla 14 dice que las órdenes no se ejecutan cuando el mercado está cerrado y quedan pendientes hasta la apertura.

Hoy `tbl_orden` solo muestra un campo `fecha`, lo cual no alcanza para distinguir:

- fecha de creación
- fecha de ejecución
- fecha de cancelación

Depuración recomendada:

- Cambiar `fecha` por `fecha_creacion`.
- Agregar `fecha_ejecucion`.
- Opcionalmente agregar `fecha_actualizacion`.
- Asegurar estados como `pendiente`, `ejecutada`, `cancelada`, `rechazada`.

### 4. Existe `saldo_congelado`, pero la regla funcional todavía no lo aclara

En `tbl_cuenta_broker` aparecen:

- `saldo_disponible`
- `saldo_congelado`

Esto es buena señal, porque permite reservar dinero para órdenes pendientes. Sin embargo, las reglas actuales solo dicen que el descuento ocurre cuando la orden se completa.

Riesgo:

- Si una orden queda pendiente por mercado cerrado y no se congela saldo, el usuario podría crear varias órdenes que juntas superen su saldo.

Depuración recomendada:

- Definir que al crear una orden de compra válida se reserve el monto en `saldo_congelado`.
- Al ejecutarse, el valor pasa de congelado a consumido.
- Si la orden se cancela o rechaza, el saldo vuelve a `saldo_disponible`.

### 5. La tabla de órdenes mezcla precio solicitado y precio ejecutado

`tbl_orden` tiene `precio`, pero no queda claro si representa:

- precio de referencia al crear la orden
- precio real de ejecución

Esto importa mucho si la orden queda pendiente y se ejecuta después.

Depuración recomendada:

- Renombrar `precio` a `precio_referencia` o `precio_solicitado`.
- Agregar `precio_ejecucion`.
- Agregar `valor_total` como dato persistido o calcularlo con `cantidad * precio_ejecucion`.

### 6. Reiniciar la demo necesita definición sobre el histórico

La regla 13 dice que al reiniciar la demo:

- se restablece el saldo inicial
- se eliminan todas las posiciones

Pero no dice qué pasa con:

- órdenes pasadas
- movimientos relacionados
- auditoría del reinicio

Depuración recomendada:

- No borrar órdenes históricas si luego se quieren reportes o trazabilidad.
- Registrar un movimiento de reinicio o una marca de reinicio de cuenta.
- Si se quiere un reinicio duro, documentarlo explícitamente.

### 7. `tbl_estado` es demasiado genérica

El modelo tiene:

- `tbl_estado`
- `tbl_estado_orden`

Eso sugiere que algunos estados son genéricos y otros específicos.

Riesgo:

- Ambigüedad sobre qué valores de `tbl_estado` aplican a persona, cuenta o activo.

Depuración recomendada:

- O bien separar estados por dominio:
  - `tbl_estado_persona`
  - `tbl_estado_cuenta`
  - `tbl_estado_activo`
- O bien mantener una tabla catálogo genérica con columna `dominio`.

### 8. La posición no tiene fechas de control

`tbl_posicion` tiene:

- `id_activo`
- `id_cuenta_broker`
- `cantidad`
- `precio_promedio`

Eso cubre el núcleo, pero faltan datos de trazabilidad.

Depuración recomendada:

- Agregar `fecha_creacion`.
- Agregar `fecha_actualizacion`.

### 9. Historial de precios necesita unicidad

`tbl_historial_precios` guarda:

- `fecha`
- `id_activo`
- precios OHLC

Depuración recomendada:

- Agregar una restricción única por `id_activo + fecha`.
- Definir si la granularidad será diaria, horaria o intradía.

### 10. Nombres con pequeñas inconsistencias

Se observan algunos nombres mejorables:

- `tipo_activos` debería ser `id_tipo_activo`
- `tbl_cuenta_gestor` y `tbl_cuenta_broker` usan estilos correctos, pero conviene dejar consistente si son cuentas o módulos
- `numero_documento var(200)` parece muy amplio; normalmente bastaría un `varchar(30)` o similar
- `correo var(200)` y `Nombre var(200)` deberían mantener mismo criterio de naming

## 2. Recomendaciones estructurales antes de implementar

### Tablas que ya van bien encaminadas

- `tbl_persona`
- `tbl_tipo_documento`
- `tbl_cuenta_gestor`
- `tbl_movimiento`
- `tbl_tipo_movimiento`
- `tbl_categoria`
- `tbl_cuenta_broker`
- `tbl_posicion`
- `tbl_activo`
- `tbl_historial_precios`
- `tbl_orden`
- `tbl_tipo_orden`
- `tbl_tipo_operacion`

### Ajustes recomendados al modelo actual

#### `tbl_persona`

- `UniqueID`
- `nombre`
- `correo`
- `numero_telefonico`
- `id_tipo_documento`
- `numero_documento`
- Restricción única sobre `correo`
- Restricción única sobre combinación `id_tipo_documento + numero_documento`

#### `tbl_cuenta_gestor`

- `UniqueID`
- `id_persona` con `UNIQUE`
- `saldo`
- `id_estado`
- Opcional: `fecha_creacion`

#### `tbl_cuenta_broker`

- `UniqueID`
- `id_persona` con `UNIQUE`
- `saldo_disponible`
- `saldo_congelado`
- `id_estado`
- Opcional: `tipo_cuenta`
- `fecha_creacion`
- `fecha_ultimo_reinicio`

#### `tbl_orden`

- `UniqueID`
- `id_activo`
- `id_cuenta_broker`
- `cantidad`
- `precio_referencia`
- `precio_ejecucion`
- `valor_total`
- `id_estado_orden`
- `id_tipo_orden`
- `id_tipo_operacion`
- `fecha_creacion`
- `fecha_ejecucion`

#### `tbl_posicion`

- `UniqueID`
- `id_activo`
- `id_cuenta_broker`
- `cantidad`
- `precio_promedio`
- `fecha_creacion`
- `fecha_actualizacion`
- Restricción única sobre `id_activo + id_cuenta_broker`

## 3. Reglas de negocio que conviene dejar más precisas

Estas reglas ya existen, pero sería mejor reescribirlas antes de construir procedimientos, servicios o constraints:

### Regla sobre saldo insuficiente

Versión más precisa:

> No se puede crear ni ejecutar una orden de compra si `cantidad * precio` supera el saldo disponible o el saldo libre para invertir.

### Regla sobre compra adicional de la misma posición

Versión más precisa:

> Si una compra ejecutada corresponde a un activo ya existente en el portafolio, la posición debe actualizar su cantidad y recalcular el precio promedio ponderado.

### Regla sobre venta

Versión más precisa:

> Solo se pueden vender activos con posición abierta y la cantidad a vender no puede superar la cantidad disponible.

### Regla sobre portafolio

Versión más precisa:

> El valor del portafolio es igual a la suma del valor de mercado de todas las posiciones abiertas más el saldo disponible de la cuenta broker.

## 4. Propuesta de decisiones para seguir

Si quieres una base más limpia, yo tomaría estas decisiones desde ya:

1. Una persona tiene un único perfil, una única cuenta de gestión y una única cuenta broker demo.
2. Toda orden pasa por estados y guarda fecha de creación y de ejecución.
3. Las órdenes pendientes congelan saldo si son de compra.
4. Las posiciones no se duplican por activo; se consolidan por cuenta y activo.
5. El reinicio demo limpia posiciones, restablece saldo y conserva histórico de órdenes para auditoría.

## 5. Siguiente paso sugerido

Con esta depuración, el siguiente paso natural sería uno de estos dos:

1. Convertir este modelo depurado a un script SQL inicial.
2. Convertirlo a entidades JPA para el backend Spring Boot.
