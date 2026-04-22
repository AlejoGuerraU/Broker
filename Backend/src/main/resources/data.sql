USE broker_db;

INSERT INTO tbl_tipo_documento (nombre) VALUES
  ('CC'),
  ('CE'),
  ('PASAPORTE')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_estado_cuenta (nombre) VALUES
  ('activa'),
  ('suspendida'),
  ('cerrada')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_estado_activo (nombre) VALUES
  ('activo'),
  ('inactivo')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_estado_orden (nombre) VALUES
  ('pendiente'),
  ('ejecutada'),
  ('cancelada'),
  ('rechazada')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_tipo_movimiento (nombre) VALUES
  ('ingreso'),
  ('egreso')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_tipo_activo (nombre) VALUES
  ('accion'),
  ('ETF'),
  ('fondo')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_tipo_orden (nombre) VALUES
  ('mercado'),
  ('limite')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_tipo_operacion (nombre) VALUES
  ('compra'),
  ('venta')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tbl_categoria (id_tipo_movimiento, nombre)
SELECT tm.id, categoria.nombre
FROM tbl_tipo_movimiento tm
JOIN (
  SELECT 'ingreso' AS tipo, 'salario' AS nombre
  UNION ALL SELECT 'ingreso', 'transferencia'
  UNION ALL SELECT 'ingreso', 'otros_ingresos'
  UNION ALL SELECT 'egreso', 'arriendo'
  UNION ALL SELECT 'egreso', 'alimentacion'
  UNION ALL SELECT 'egreso', 'transporte'
  UNION ALL SELECT 'egreso', 'servicios'
  UNION ALL SELECT 'egreso', 'otros_gastos'
) categoria ON categoria.tipo = tm.nombre
WHERE NOT EXISTS (
  SELECT 1
  FROM tbl_categoria c
  WHERE c.id_tipo_movimiento = tm.id
    AND c.nombre = categoria.nombre
);
