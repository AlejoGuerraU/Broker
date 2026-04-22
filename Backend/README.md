# Broker Backend

Documentacion del backend Spring Boot del proyecto Broker, actualizada con los cambios realizados el 18 y 19 de abril de 2026.

## Resumen

El backend de Broker es una API Spring Boot responsable de:

- exponer CRUD de movimientos financieros personales
- exponer posiciones y ordenes del portafolio demo
- sincronizar datos de mercado con Alpha Vantage
- mantener un respaldo persistido local para mercado
- crear ordenes demo de compra y venta
- aplicar reglas de negocio sobre saldo, posiciones y horario de mercado

La API trabaja sobre MySQL usando Spring Data JPA y hoy es la unica fuente de verdad para los modulos de movimientos, portafolio e invertir.

## Stack tecnico

- Java 21
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Spring Validation
- MySQL Connector/J
- Maven

## Estructura principal

```text
Backend/
|-- pom.xml
|-- README.md
`-- src/
    `-- main/
        |-- java/com/broker/backend/
        |   |-- config/
        |   |-- controller/
        |   |-- exception/
        |   |-- model/
        |   |-- persistence/
        |   `-- service/
        `-- resources/
            |-- application.properties
            |-- schema.sql
            |-- data.sql
            |-- seed_movimientos_demo.sql
            `-- seed_portafolio_demo.sql
```

## Modulos funcionales

### 1. Movimientos

Responsabilidad:

- administrar ingresos y egresos del modulo de control de dinero

Capacidades:

- listar movimientos
- crear movimientos
- editar movimientos
- eliminar movimientos
- recalcular el saldo de la cuenta gestora despues de cada cambio

Persistencia:

- `tbl_movimiento`
- `tbl_cuenta_gestor`
- `tbl_categoria`

### 2. Portafolio

Responsabilidad:

- exponer posiciones y ordenes de la cuenta broker demo

Capacidades:

- devolver posiciones desde `tbl_posicion`
- devolver ordenes desde `tbl_orden`
- calcular variacion diaria usando `tbl_historial_precios`

Persistencia:

- `tbl_posicion`
- `tbl_orden`
- `tbl_historial_precios`
- `tbl_cuenta_broker`

### 3. Mercado

Responsabilidad:

- servir el listado de acciones disponibles para invertir
- sincronizar o reutilizar precios de mercado

Capacidades:

- obtener mercado desde Alpha Vantage cuando hay respuesta util
- persistir activos en `tbl_activo`
- persistir snapshots de precio en `tbl_historial_precios`
- usar el ultimo estado persistido cuando el proveedor falla
- sembrar un respaldo local minimo si la base esta vacia
- exponer un endpoint de diagnostico de fuente de datos

Persistencia:

- `tbl_activo`
- `tbl_historial_precios`

### 4. Trading demo

Responsabilidad:

- crear ordenes demo de compra y venta

Capacidades:

- validar saldo disponible en compras
- validar existencia y cantidad de posicion en ventas
- ejecutar ordenes inmediatamente si el mercado esta abierto
- dejar ordenes pendientes si el mercado esta cerrado
- actualizar saldo disponible y saldo congelado
- crear o actualizar posiciones con precio promedio ponderado

Persistencia:

- `tbl_orden`
- `tbl_posicion`
- `tbl_cuenta_broker`

## Endpoints disponibles

### Movimientos

- `GET /api/movimientos`
- `POST /api/movimientos`
- `PUT /api/movimientos/{id}`
- `DELETE /api/movimientos/{id}`

### Portafolio

- `GET /api/portafolio/positions`
- `GET /api/portafolio/orders`
- `POST /api/portafolio/orders`

### Mercado

- `GET /api/market/most-active`
- `GET /api/market/assets/{symbol}`
- `GET /api/market/status`

## Flujo actual del mercado

El backend ya no depende de una segunda capa intermedia en frontend para mercado.

Flujo:

1. El frontend llama a `GET /api/market/most-active`.
2. `MarketService` intenta obtener datos desde Alpha Vantage.
3. Si el proveedor responde con datos utiles, el backend:
   - actualiza o crea activos en `tbl_activo`
   - guarda snapshots de precio en `tbl_historial_precios`
4. Si el proveedor no responde o no entrega datos validos, el backend:
   - intenta servir el ultimo estado persistido
5. Si la base aun no tiene activos persistidos, el backend:
   - crea automaticamente un conjunto base de acciones para que la app siga operativa

Diagnostico:

- `GET /api/market/status` permite ver si la fuente actual es `alpha_vantage` o `respaldo_local`

## Flujo actual de ordenes

Cuando el frontend envia `POST /api/portafolio/orders`, el backend:

1. resuelve la cuenta broker demo por defecto
2. resuelve el activo consultando mercado persistido
3. valida tipo de operacion, tipo de orden y cantidad
4. calcula precio de referencia y valor total
5. valida saldo disponible o posicion existente
6. decide si el mercado esta abierto usando horario de Nueva York
7. si el mercado esta abierto:
   - ejecuta la orden
   - actualiza saldos
   - actualiza o elimina posiciones
8. si el mercado esta cerrado:
   - deja la orden pendiente
   - congela saldo si la orden es de compra

## Reglas de negocio implementadas

- la cuenta broker demo se crea automaticamente si no existe
- el saldo inicial demo es de `30.000.000`
- no se aceptan cantidades menores o iguales a cero
- no se puede comprar por encima del saldo disponible
- no se puede vender un activo sin posicion abierta
- no se puede vender una cantidad superior a la disponible
- las compras actualizan el precio promedio ponderado
- las ventas reducen la posicion o la eliminan si llega a cero
- cuando el mercado esta cerrado, las ordenes quedan pendientes

## Variables de entorno

Variables soportadas:

```env
DB_URL=jdbc:mysql://localhost:3306/broker_db?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=root
ALPHA_VANTAGE_API_KEY=tu_api_key
```

Configuracion actual en `src/main/resources/application.properties`:

```properties
server.port=8080
app.cors.allowed-origin=http://localhost:3000
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/broker_db?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:root}
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=never
alpha.vantage.api-key=${ALPHA_VANTAGE_API_KEY:}
```

Notas:

- si no configuras `ALPHA_VANTAGE_API_KEY`, el backend seguira operando con mercado persistido o con el respaldo local minimo
- `spring.sql.init.mode=never` implica que la inicializacion es manual

## Requisitos

- Java 21
- Maven 3.9+
- MySQL disponible

## Como ejecutar

### 1. Preparar la base de datos

Ejecuta en MySQL:

```text
src/main/resources/schema.sql
src/main/resources/data.sql
src/main/resources/seed_movimientos_demo.sql
src/main/resources/seed_portafolio_demo.sql
```

### 2. Levantar el backend

Desde `Backend/`:

```bash
mvn spring-boot:run
```

La API queda disponible en:

```text
http://localhost:8080
```

## CORS

Por defecto se permite el frontend en `http://localhost:3000`.

Si necesitas otro origen:

```properties
app.cors.allowed-origin=http://localhost:3001
```

## Tablas principales utilizadas

| Tabla | Uso |
|---|---|
| `tbl_persona` | Persona demo |
| `tbl_cuenta_gestor` | Cuenta del modulo de dinero |
| `tbl_cuenta_broker` | Cuenta broker demo |
| `tbl_movimiento` | Ingresos y egresos |
| `tbl_categoria` | Categoria por tipo de movimiento |
| `tbl_activo` | Catalogo de activos |
| `tbl_historial_precios` | Snapshots OHLC |
| `tbl_posicion` | Posiciones abiertas |
| `tbl_orden` | Ordenes de compra/venta |

## Limitaciones actuales

- no existe autenticacion
- no existe multiusuario real
- la inicializacion de base de datos sigue siendo manual
- no existe un job programado para refrescar mercado automaticamente
- las ordenes pendientes aun no se reintentan automaticamente cuando el mercado vuelve a abrir
- no hay una cobertura completa de pruebas automatizadas para todos los flujos

## Siguientes pasos recomendados

- automatizar schema y seeds en entornos locales
- agregar scheduler para refresco de mercado durante horario habil
- agregar proceso para ejecucion de ordenes pendientes
- extender `GET /api/market/status` con fecha del ultimo snapshot persistido
- agregar pruebas de servicios criticos como `MarketService` y `TradingService`
