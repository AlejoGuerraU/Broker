# Broker Backend

Base inicial de backend con Spring Boot para el proyecto Broker.

## Requisitos

- Java 21
- Maven 3.9+ o Spring Tools con soporte Maven

## Ejecutar

```bash
mvn spring-boot:run
```

La API quedara disponible en `http://localhost:8080`.

## Endpoints disponibles

- `GET /api/movimientos`
- `POST /api/movimientos`
- `PUT /api/movimientos/{id}`
- `DELETE /api/movimientos/{id}`
- `GET /api/portafolio/positions`
- `GET /api/portafolio/orders`
- `GET /api/market/most-active`

## CORS

Por defecto se permite el frontend en `http://localhost:3000`.

Si necesitas otro origen:

```properties
app.cors.allowed-origin=http://localhost:3001
```
