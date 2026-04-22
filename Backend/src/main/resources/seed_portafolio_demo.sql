USE broker_db;

INSERT INTO tbl_persona (
  nombre,
  correo,
  numero_telefonico,
  id_tipo_documento,
  numero_documento
)
SELECT
  'Usuario Demo Broker',
  'demo@broker.local',
  '3000000000',
  td.id,
  '1000000000'
FROM tbl_tipo_documento td
WHERE td.nombre = 'CC'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_persona p WHERE p.correo = 'demo@broker.local'
  );

INSERT INTO tbl_cuenta_broker (
  id_persona,
  tipo_cuenta,
  saldo_disponible,
  saldo_congelado,
  saldo_inicial_demo,
  id_estado_cuenta
)
SELECT
  p.id,
  'demo',
  30000000.00,
  0.00,
  30000000.00,
  ec.id
FROM tbl_persona p
JOIN tbl_estado_cuenta ec ON ec.nombre = 'activa'
WHERE p.correo = 'demo@broker.local'
  AND NOT EXISTS (
    SELECT 1
    FROM tbl_cuenta_broker cb
    WHERE cb.id_persona = p.id
      AND cb.tipo_cuenta = 'demo'
  );

INSERT INTO tbl_activo (nombre, simbolo, id_tipo_activo, id_estado_activo, precio_actual, mercado, moneda)
SELECT 'Apple Inc.', 'AAPL', ta.id, ea.id, 196.42, 'Tecnologia', 'USD'
FROM tbl_tipo_activo ta
JOIN tbl_estado_activo ea ON ea.nombre = 'activo'
WHERE ta.nombre = 'accion'
  AND NOT EXISTS (SELECT 1 FROM tbl_activo a WHERE a.simbolo = 'AAPL');

INSERT INTO tbl_activo (nombre, simbolo, id_tipo_activo, id_estado_activo, precio_actual, mercado, moneda)
SELECT 'Microsoft Corp.', 'MSFT', ta.id, ea.id, 417.80, 'Tecnologia', 'USD'
FROM tbl_tipo_activo ta
JOIN tbl_estado_activo ea ON ea.nombre = 'activo'
WHERE ta.nombre = 'accion'
  AND NOT EXISTS (SELECT 1 FROM tbl_activo a WHERE a.simbolo = 'MSFT');

INSERT INTO tbl_activo (nombre, simbolo, id_tipo_activo, id_estado_activo, precio_actual, mercado, moneda)
SELECT 'Coca-Cola Co.', 'KO', ta.id, ea.id, 56.92, 'Consumo', 'USD'
FROM tbl_tipo_activo ta
JOIN tbl_estado_activo ea ON ea.nombre = 'activo'
WHERE ta.nombre = 'accion'
  AND NOT EXISTS (SELECT 1 FROM tbl_activo a WHERE a.simbolo = 'KO');

INSERT INTO tbl_activo (nombre, simbolo, id_tipo_activo, id_estado_activo, precio_actual, mercado, moneda)
SELECT 'JPMorgan Chase', 'JPM', ta.id, ea.id, 198.55, 'Financiero', 'USD'
FROM tbl_tipo_activo ta
JOIN tbl_estado_activo ea ON ea.nombre = 'activo'
WHERE ta.nombre = 'accion'
  AND NOT EXISTS (SELECT 1 FROM tbl_activo a WHERE a.simbolo = 'JPM');

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-11 00:00:00', 193.10, 195.20, 192.80, 193.98
FROM tbl_activo a
WHERE a.simbolo = 'AAPL'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-11 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-12 00:00:00', 194.10, 197.30, 193.90, 196.42
FROM tbl_activo a
WHERE a.simbolo = 'AAPL'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-12 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-11 00:00:00', 413.20, 415.90, 411.60, 414.31
FROM tbl_activo a
WHERE a.simbolo = 'MSFT'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-11 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-12 00:00:00', 414.80, 418.60, 413.90, 417.80
FROM tbl_activo a
WHERE a.simbolo = 'MSFT'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-12 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-11 00:00:00', 57.10, 57.60, 56.80, 57.28
FROM tbl_activo a
WHERE a.simbolo = 'KO'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-11 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-12 00:00:00', 57.00, 57.10, 56.60, 56.92
FROM tbl_activo a
WHERE a.simbolo = 'KO'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-12 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-11 00:00:00', 197.10, 198.00, 196.20, 197.62
FROM tbl_activo a
WHERE a.simbolo = 'JPM'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-11 00:00:00'
  );

INSERT INTO tbl_historial_precios (id_activo, fecha, precio_apertura, precio_maximo, precio_minimo, precio_cierre)
SELECT a.id, '2026-04-12 00:00:00', 197.80, 199.20, 197.30, 198.55
FROM tbl_activo a
WHERE a.simbolo = 'JPM'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_historial_precios hp WHERE hp.id_activo = a.id AND hp.fecha = '2026-04-12 00:00:00'
  );

INSERT INTO tbl_posicion (id_cuenta_broker, id_activo, cantidad, precio_promedio)
SELECT cb.id, a.id, 12.0000, 182.35
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'AAPL'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_posicion pos WHERE pos.id_cuenta_broker = cb.id AND pos.id_activo = a.id
  );

INSERT INTO tbl_posicion (id_cuenta_broker, id_activo, cantidad, precio_promedio)
SELECT cb.id, a.id, 8.0000, 401.20
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'MSFT'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_posicion pos WHERE pos.id_cuenta_broker = cb.id AND pos.id_activo = a.id
  );

INSERT INTO tbl_posicion (id_cuenta_broker, id_activo, cantidad, precio_promedio)
SELECT cb.id, a.id, 20.0000, 58.10
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'KO'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_posicion pos WHERE pos.id_cuenta_broker = cb.id AND pos.id_activo = a.id
  );

INSERT INTO tbl_posicion (id_cuenta_broker, id_activo, cantidad, precio_promedio)
SELECT cb.id, a.id, 10.0000, 191.70
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'JPM'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_posicion pos WHERE pos.id_cuenta_broker = cb.id AND pos.id_activo = a.id
  );

INSERT INTO tbl_orden (
  id_cuenta_broker,
  id_activo,
  id_estado_orden,
  id_tipo_orden,
  id_tipo_operacion,
  cantidad,
  precio_referencia,
  precio_ejecucion,
  valor_total,
  fecha_creacion,
  fecha_ejecucion
)
SELECT cb.id, a.id, eo.id, to2.id, top.id, 4.0000, 191.50, 191.50, 766.00, '2026-03-21 09:15:00', '2026-03-21 09:15:00'
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'AAPL'
JOIN tbl_estado_orden eo ON eo.nombre = 'ejecutada'
JOIN tbl_tipo_orden to2 ON to2.nombre = 'mercado'
JOIN tbl_tipo_operacion top ON top.nombre = 'compra'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_orden o WHERE o.id_cuenta_broker = cb.id AND o.id_activo = a.id AND o.fecha_creacion = '2026-03-21 09:15:00'
  );

INSERT INTO tbl_orden (
  id_cuenta_broker,
  id_activo,
  id_estado_orden,
  id_tipo_orden,
  id_tipo_operacion,
  cantidad,
  precio_referencia,
  precio_ejecucion,
  valor_total,
  fecha_creacion,
  fecha_ejecucion
)
SELECT cb.id, a.id, eo.id, to2.id, top.id, 2.0000, 412.20, 412.20, 824.40, '2026-03-24 10:30:00', '2026-03-24 10:30:00'
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'MSFT'
JOIN tbl_estado_orden eo ON eo.nombre = 'ejecutada'
JOIN tbl_tipo_orden to2 ON to2.nombre = 'mercado'
JOIN tbl_tipo_operacion top ON top.nombre = 'compra'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_orden o WHERE o.id_cuenta_broker = cb.id AND o.id_activo = a.id AND o.fecha_creacion = '2026-03-24 10:30:00'
  );

INSERT INTO tbl_orden (
  id_cuenta_broker,
  id_activo,
  id_estado_orden,
  id_tipo_orden,
  id_tipo_operacion,
  cantidad,
  precio_referencia,
  precio_ejecucion,
  valor_total,
  fecha_creacion,
  fecha_ejecucion
)
SELECT cb.id, a.id, eo.id, to2.id, top.id, 5.0000, 57.40, NULL, NULL, '2026-03-28 14:00:00', NULL
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'KO'
JOIN tbl_estado_orden eo ON eo.nombre = 'pendiente'
JOIN tbl_tipo_orden to2 ON to2.nombre = 'limite'
JOIN tbl_tipo_operacion top ON top.nombre = 'venta'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_orden o WHERE o.id_cuenta_broker = cb.id AND o.id_activo = a.id AND o.fecha_creacion = '2026-03-28 14:00:00'
  );

INSERT INTO tbl_orden (
  id_cuenta_broker,
  id_activo,
  id_estado_orden,
  id_tipo_orden,
  id_tipo_operacion,
  cantidad,
  precio_referencia,
  precio_ejecucion,
  valor_total,
  fecha_creacion,
  fecha_ejecucion
)
SELECT cb.id, a.id, eo.id, to2.id, top.id, 3.0000, 197.10, NULL, NULL, '2026-03-30 16:20:00', NULL
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
JOIN tbl_activo a ON a.simbolo = 'JPM'
JOIN tbl_estado_orden eo ON eo.nombre = 'cancelada'
JOIN tbl_tipo_orden to2 ON to2.nombre = 'mercado'
JOIN tbl_tipo_operacion top ON top.nombre = 'compra'
WHERE p.correo = 'demo@broker.local'
  AND cb.tipo_cuenta = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM tbl_orden o WHERE o.id_cuenta_broker = cb.id AND o.id_activo = a.id AND o.fecha_creacion = '2026-03-30 16:20:00'
  );