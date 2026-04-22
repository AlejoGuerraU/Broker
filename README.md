# Broker

Documentacion del estado actual del proyecto a fecha de abril de 2026, actualizada con los cambios registrados hasta el 21 de abril de 2026.

## Resumen

Broker es una aplicacion dividida en dos partes:

- `nexa`: frontend en Next.js para visualizar portafolio, mercado, control de dinero y noticias.
- `Backend`: API en Spring Boot que expone datos para movimientos, portafolio y mercado.

El proyecto es un ecosistema multi-usuario protegido por **Google Authentication**. Los modulos de movimientos, portafolio e invertir estan conectados al backend Spring como fuente unica de verdad y los datos estan aislados por cuenta de usuario (correo electronico). El mercado se sincroniza desde Alpha Vantage hacia MySQL y, cuando no hay respuesta util del proveedor externo, la aplicacion trabaja con el ultimo estado persistido en base de datos. Las ordenes pendientes se procesan automaticamente mediante un job programado que se ejecuta cada minuto mientras el mercado este abierto.

La aplicacion utiliza un esquema de seguridad basado en **JWT** propio generado por el backend tras validar el ID Token de Google proporcionado por el frontend a través de **NextAuth.js**.

## Arquitectura actual

### Frontend

- Framework: Next.js 15.1.4
- UI: React 19 + Tailwind CSS 4
- Graficas: Chart.js + react-chartjs-2
- Autenticacion: NextAuth.js 4.24
- Iconos: @iconify/react
- Ubicacion: `nexa/`
- Puerto esperado: `http://localhost:3000`

Pantallas disponibles:

- `/`: vista inicial simple con fecha
- `/portafolio`: resumen del portafolio, posiciones y ordenes
- `/invertir`: listado de acciones, comparativa visual y tarjeta de compra/venta
- `/controlador`: control de ingresos y egresos con CRUD de movimientos
- `/noticias`: tablero visual de noticias por categorias

### Backend

- Framework: Spring Boot 3.3.5
- Java: 21
- Seguridad: Spring Security + JJWT (JSON Web Token)
- Persistencia: Spring Data JPA + MySQL
- Validacion: `spring-boot-starter-validation`
- Ubicacion: `Backend/`
- Puerto esperado: `http://localhost:8080`

Responsabilidades actuales:

- exponer movimientos financieros con CRUD completo aislados por usuario
- exponer posiciones y ordenes del portafolio desde base de datos por usuario
- exponer resumen de saldos de la cuenta broker (disponible y congelado) por usuario
- crear ordenes de compra y venta vinculadas al usuario autenticado
- procesar ordenes pendientes automaticamente mediante job programado
- exponer mercado desde `tbl_activo` y `tbl_historial_precios`
- sincronizar datos de mercado con Alpha Vantage cuando hay respuesta disponible
- usar respaldo persistido local cuando el proveedor no responde
- sembrar un mercado base minimo si la base esta vacia
- crear automaticamente perfiles de persona y cuentas (broker/gestor) al primer inicio de sesion
- gestionar autenticacion mediante verificacion de Google ID Tokens y generacion de JWT
- manejar errores de forma centralizada con respuestas JSON estandarizadas
- habilitar CORS para el frontend local con soporte para credenciales

## Estado funcional por modulo

### 1. Portafolio

Estado: **funcional con datos persistidos en MySQL**.

Frontend:

- consume `GET /api/portafolio/positions`
- consume `GET /api/portafolio/orders`
- calcula valor actual, rendimiento y variacion diaria promedio
- muestra tabla de acciones y tabla de ordenes
- abre modal con detalle de la accion seleccionada

Backend:

- responde desde `PortfolioService`
- resuelve la cuenta broker demo con `DefaultCuentaBrokerService`
- consulta posiciones desde `PosicionRepository` sobre `tbl_posicion`
- consulta ordenes desde `OrdenRepository` sobre `tbl_orden`
- calcula variacion diaria usando los dos ultimos precios de `HistorialPrecioRepository`
- refresca cotizaciones de los activos en posicion al consultar posiciones
- expone resumen de cuenta en `GET /api/portafolio/summary` con saldo disponible y congelado
- usa los datos base cargados por `seed_portafolio_demo.sql`

### 2. Control de dinero

Estado: **funcional con CRUD persistido en MySQL**.

Frontend:

- lista movimientos
- crea nuevos movimientos
- edita movimientos existentes
- elimina movimientos
- calcula ingresos, egresos y balance
- construye una grafica acumulada a partir del historial

Backend:

- expone CRUD en `/api/movimientos`
- usa `MovimientoRepository` sobre `tbl_movimiento`
- resuelve categorias por tipo con `MovimientoCategoriaService`
- crea categorias nuevas automaticamente si no existen para el tipo solicitado
- crea o reutiliza una cuenta gestora demo por defecto con `DefaultCuentaGestorService`
- recalcula el saldo de la cuenta gestora despues de crear, editar o eliminar un movimiento
- valida payloads de entrada

Importante:

- los cambios sobreviven a reinicios siempre que la base de datos se conserve
- el backend no auto-inicializa schema ni seeds porque `spring.sql.init.mode=never`
- el esquema y los datos base deben cargarse manualmente

### 3. Invertir

Estado: **funcional sobre backend y base de datos**.

Frontend:

- consume `GET /api/market/most-active`
- consume `POST /api/portafolio/orders`
- permite buscar acciones por nombre o simbolo
- dibuja una comparativa visual semanal
- muestra una tarjeta de operacion para comprar o vender
- muestra errores reales del backend en vez de ocultarlos con datos mock

Backend:

- expone `GET /api/market/most-active`
- expone `GET /api/market/assets/{symbol}`
- expone `GET /api/market/status`
- sincroniza mercado con Alpha Vantage cuando hay datos disponibles
- persiste activos en `tbl_activo`
- persiste snapshots de precio en `tbl_historial_precios`
- usa respaldo local persistido cuando el proveedor externo no responde
- si la base aun no tiene activos, siembra un mercado base minimo para mantener operativa la simulacion
- expone `POST /api/portafolio/orders` para crear ordenes de compra y venta
- admite ordenes de tipo `mercado` (precio actual) y tipo `limite` (precio especificado)
- valida saldo disponible, posicion existente, cantidad y horario de mercado
- si el mercado esta abierto, la orden se ejecuta inmediatamente y actualiza posicion y saldo
- si el mercado esta cerrado, la orden queda pendiente y se congela el saldo correspondiente
- procesa ordenes pendientes mediante un job programado cada minuto (`TradingService`)
- si una orden pendiente no puede ejecutarse al procesarse (saldo insuficiente u otro error), se marca como rechazada y se libera el saldo congelado
- expone `GET /api/portafolio/summary` para consultar saldo disponible y congelado de la cuenta broker

### 4. Noticias

Estado: **visualmente construido, sin integracion real**.

Actualmente:

- existen filtros por categoria
- se muestran tarjetas de noticias con imagen, fecha y descripcion
- el contenido proviene de datos locales
- no hay consumo de API ni persistencia

## Seguridad y Autenticacion

El sistema implementa un flujo de autenticacion robusto:

1. **Frontend**: El usuario inicia sesion con Google usando `NextAuth.js`.
2. **Intercambio de Token**: El frontend envia el `id_token` de Google al endpoint `/api/auth/google` del backend.
3. **Validacion**: El backend verifica la autenticidad del token usando la libreria oficial de Google.
4. **Sincronizacion**: Si el usuario no existe, se crea su perfil (`tbl_persona`) y sus cuentas demo (`tbl_cuenta_broker` y `tbl_cuenta_gestor`) automaticamente.
5. **JWT**: El backend genera un JSON Web Token (JWT) propio y lo devuelve al frontend.
6. **Sesion**: `NextAuth.js` almacena este JWT en la sesion del cliente.
7. **Peticiones Protegidas**: Todas las peticiones posteriores incluyen el JWT en el header `Authorization: Bearer <token>`.

El backend utiliza un filtro personalizado `JwtAuthFilter` y configuracion de `SecurityConfig` para proteger los endpoints y extraer el contexto del usuario (email) de forma segura.

## API disponible

### Movimientos

- `GET /api/movimientos`
- `POST /api/movimientos`
- `PUT /api/movimientos/{id}`
- `DELETE /api/movimientos/{id}`

### Portafolio

- `GET /api/portafolio/positions`
- `GET /api/portafolio/orders`
- `GET /api/portafolio/summary`
- `POST /api/portafolio/orders`

### Mercado

- `GET /api/market/most-active`
- `GET /api/market/assets/{symbol}`
- `GET /api/market/status`

## Contratos de API destacados

### POST /api/portafolio/orders

Request body:

```json
{
  "simbolo": "AAPL",
  "tipoOperacion": "compra",
  "cantidad": 2,
  "tipoOrden": "mercado",
  "precioLimite": null
}
```

- `tipoOperacion`: `"compra"` o `"venta"`
- `tipoOrden`: `"mercado"` (usa precio actual) o `"limite"` (requiere `precioLimite`)
- `precioLimite`: requerido solo si `tipoOrden` es `"limite"`, debe ser mayor a cero

### GET /api/portafolio/summary

Response:

```json
{
  "available_cash": 25000000.00,
  "frozen_cash": 5000000.00
}
```

## Flujo actual entre aplicaciones

1. El usuario navega en `nexa`.
2. La pantalla de portafolio consulta el backend Spring y obtiene posiciones y ordenes reales desde MySQL.
3. Al consultar posiciones, el backend refresca automaticamente las cotizaciones de los activos en posicion.
4. La pantalla de control de dinero consulta el backend Spring y persiste movimientos en MySQL.
5. La pantalla de invertir consulta solo al backend Spring para listar acciones y crear ordenes.
6. El backend intenta sincronizar mercado con Alpha Vantage.
7. Si Alpha Vantage responde, actualiza `tbl_activo` y `tbl_historial_precios`.
8. Si Alpha Vantage no responde o no entrega datos utiles, el backend sirve el ultimo estado persistido.
9. Si la base esta vacia, el backend crea automaticamente un respaldo local minimo para no dejar el modulo de invertir sin datos.
10. Las ordenes creadas fuera de horario de mercado quedan pendientes con saldo congelado.
11. Cada minuto, `TradingService` ejecuta un job programado que intenta ejecutar las ordenes pendientes si el mercado esta abierto.
12. Las ordenes pendientes que no puedan ejecutarse se marcan como rechazadas y se libera el saldo congelado.
13. La pantalla de noticias aun no consulta servicios externos.

## Fuente de datos de mercado

La aplicacion no usa una API route interna de Next para mercado ni mantiene doble fuente de verdad.

Comportamiento actual del backend:

- intenta obtener mercado desde Alpha Vantage usando `ALPHA_VANTAGE_API_KEY`
- si obtiene datos validos, persiste o actualiza activos en `tbl_activo`
- guarda snapshots de precio en `tbl_historial_precios`
- si Alpha Vantage no responde, no tiene datos o esta limitado, usa el ultimo estado persistido
- si aun no existe mercado persistido, crea un conjunto base de acciones para que la app siga operativa

El endpoint `GET /api/market/status` permite ver:

- si la API key esta configurada
- si Alpha Vantage esta disponible en ese momento
- cuantos activos hay persistidos
- si la fuente actual es `alpha_vantage` o `respaldo_local`

## Reglas de negocio implementadas en invertir

- la cuenta broker demo se crea automaticamente si no existe
- el saldo inicial demo es de `30.000.000`
- no se permiten cantidades menores o iguales a cero (minimo `0.0001`)
- una compra no puede exceder el saldo disponible
- una compra ejecutada descuenta el monto del saldo disponible y actualiza o crea la posicion con precio promedio ponderado
- una venta solo puede hacerse si existe posicion abierta con suficiente cantidad
- una venta ejecutada aumenta el saldo disponible y reduce o elimina la posicion
- si el mercado esta abierto (lunes a viernes, 9:30 a 16:00 hora de Nueva York), la orden se ejecuta inmediatamente
- si el mercado esta cerrado, la orden queda pendiente y el saldo de la compra se mueve a saldo congelado
- el job programado de `TradingService` corre cada minuto e intenta ejecutar las ordenes pendientes cuando el mercado esta abierto
- si una orden pendiente de compra no tiene saldo suficiente al ejecutarse, se rechaza y se libera el saldo congelado
- las ordenes limite usan el precio indicado como precio de referencia; las ordenes de mercado usan el precio actual del activo

## Estado de ordenes

| Estado | Descripcion |
|---|---|
| `ejecutada` | Orden completada exitosamente |
| `pendiente` | Orden en espera de apertura de mercado |
| `rechazada` | Orden que no pudo ejecutarse al procesarse |
| `cancelada` | Orden cancelada (catalogada pero no usada aun) |

## Variables de entorno

### Frontend (`nexa/.env.local`)

Variables detectadas o esperadas:

```env
NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_para_sesiones
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

Notas:

- `NEXT_PUBLIC_BACKEND_API_BASE_URL` conecta el frontend con Spring Boot
- `NEXTAUTH_SECRET` es necesario para encriptar las cookies de sesion
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` se obtienen de Google Cloud Console

### Backend

Configuracion actual en `Backend/src/main/resources/application.properties`:

```properties
server.port=8080
app.cors.allowed-origin=http://localhost:3000
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/broker_db?...}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:root}
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=never

# Seguridad
app.jwt.secret=${JWT_SECRET:clave_secreta_para_firmar_tokens}
app.jwt.expiration-ms=86400000
google.client-id=${GOOGLE_CLIENT_ID:tu_google_client_id}

# Mercado
alpha.vantage.api-key=${ALPHA_VANTAGE_API_KEY:}
```

Variables de entorno opcionales del backend:

```env
DB_URL=jdbc:mysql://localhost:3306/broker_db?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=root
ALPHA_VANTAGE_API_KEY=tu_api_key
```

Notas:

- si no defines las variables de entorno de base de datos, Spring usa los valores por defecto indicados arriba
- si no defines `ALPHA_VANTAGE_API_KEY`, el modulo de mercado seguira funcionando usando el respaldo persistido o el respaldo local minimo
- la base `broker_db` debe existir antes de levantar el backend
- el delay del job de ordenes pendientes se puede configurar con `broker.orders.pending-processor-delay-ms` (por defecto `60000` ms)

## Como ejecutar el proyecto

### 1. Preparar la base de datos

Antes de levantar el backend, ejecuta en MySQL en este orden:

```text
Backend/src/main/resources/schema.sql
Backend/src/main/resources/data.sql
Backend/src/main/resources/seed_movimientos_demo.sql
Backend/src/main/resources/seed_portafolio_demo.sql
```

- `schema.sql`: crea la base de datos y las tablas
- `data.sql`: inserta catalogos base (tipos de orden, operacion, estado, etc.)
- `seed_movimientos_demo.sql`: inserta movimientos demo
- `seed_portafolio_demo.sql`: inserta activos, posiciones y ordenes demo del portafolio

### 2. Backend

Desde `Backend/`:

```bash
mvn spring-boot:run
```

Backend disponible en:

```text
http://localhost:8080
```

### 3. Frontend

Desde `nexa/`:

```bash
npm install
npm run dev
```

Frontend disponible en:

```text
http://localhost:3000
```

## Esquema de base de datos

La base `broker_db` contiene las siguientes tablas principales:

| Tabla | Descripcion |
|---|---|
| `tbl_tipo_documento` | Tipos de documento de identidad |
| `tbl_estado_cuenta` | Estados de cuenta |
| `tbl_estado_activo` | Estados de activo financiero |
| `tbl_estado_orden` | Estados de orden (`ejecutada`, `pendiente`, `rechazada`, `cancelada`) |
| `tbl_tipo_movimiento` | Tipos de movimiento |
| `tbl_tipo_activo` | Tipos de activo |
| `tbl_tipo_orden` | Tipos de orden (`mercado`, `limite`) |
| `tbl_tipo_operacion` | Tipos de operacion (`compra`, `venta`) |
| `tbl_categoria` | Categorias de movimiento por tipo |
| `tbl_persona` | Datos de la persona demo |
| `tbl_cuenta_gestor` | Cuenta gestora de dinero personal |
| `tbl_cuenta_broker` | Cuenta broker demo o real (con saldo disponible, congelado y fecha de ultimo reinicio) |
| `tbl_activo` | Activos financieros disponibles |
| `tbl_historial_precios` | Historial OHLC de precios por activo |
| `tbl_posicion` | Posiciones abiertas por cuenta broker |
| `tbl_orden` | Ordenes de compra y venta |
| `tbl_movimiento` | Movimientos financieros personales |

## Limitaciones actuales

- la inicializacion de base de datos sigue siendo manual
- el mercado depende de Alpha Vantage como proveedor externo, aunque ya existe respaldo persistido
- noticias sigue usando contenido local sin integracion a API externa
- no se observan pruebas automatizadas completas de frontend o backend para todos los flujos criticos
- el home `/` sigue siendo una pantalla minima

## Siguientes pasos recomendados

- automatizar la inicializacion de schema y seeds del backend (usar Flyway o Liquibase)
- agregar un proceso programado para refrescar mercado durante horario habil
- ampliar el diagnostico de mercado con fecha del ultimo snapshot persistido
- crear pruebas para servicios del backend y flujos criticos del frontend
- integrar noticias reales desde una API
- mejorar la pagina inicial para que refleje mejor el producto
- implementar reinicio de cuenta demo (ya existe `fecha_ultimo_reinicio` en `tbl_cuenta_broker`)

## Estructura general del repo

```text
Broker/
|-- Backend/
|   |-- src/main/java/com/broker/backend/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- exception/
|   |   |-- model/
|   |   |   |-- market/
|   |   |   |-- movimiento/
|   |   |   `-- portafolio/
|   |   |-- persistence/
|   |   |   |-- entity/
|   |   |   `-- repository/
|   |   `-- service/
|   `-- src/main/resources/
|-- nexa/
|   |-- src/components/
|   |   |-- atoms/
|   |   |-- moleculas/
|   |   `-- organismos/
|   |-- src/mappers/
|   |-- src/pages/
|   |-- src/services/
|   |-- src/styles/
|   `-- src/types/
|-- RecursosAdicionales/
`-- README.md
```

## Referencias rapidas

- Frontend principal: `nexa/src/pages/`
- Servicios frontend: `nexa/src/services/`
- Tipos frontend: `nexa/src/types/`
- Mappers frontend: `nexa/src/mappers/`
- Controladores backend: `Backend/src/main/java/com/broker/backend/controller/`
- Servicios backend: `Backend/src/main/java/com/broker/backend/service/`
- Modelos de request/response: `Backend/src/main/java/com/broker/backend/model/`
- Entidades JPA: `Backend/src/main/java/com/broker/backend/persistence/entity/`
- Repositorios JPA: `Backend/src/main/java/com/broker/backend/persistence/repository/`
- Scripts SQL: `Backend/src/main/resources/`
- Material de apoyo: `RecursosAdicionales/`
