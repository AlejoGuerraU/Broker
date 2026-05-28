INSERT INTO tbl_tipo_documento (nombre) VALUES
  ('CC'),
  ('CE'),
  ('PASAPORTE')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_estado_cuenta (nombre) VALUES
  ('activa'),
  ('suspendida'),
  ('cerrada')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_estado_activo (nombre) VALUES
  ('activo'),
  ('inactivo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_estado_orden (nombre) VALUES
  ('pendiente'),
  ('ejecutada'),
  ('cancelada'),
  ('rechazada')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_tipo_movimiento (nombre) VALUES
  ('ingreso'),
  ('egreso')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_tipo_activo (nombre) VALUES
  ('accion'),
  ('ETF'),
  ('fondo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_tipo_orden (nombre) VALUES
  ('mercado'),
  ('limite'),
  ('stop')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_tipo_operacion (nombre) VALUES
  ('compra'),
  ('venta')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_categoria (id_tipo_movimiento, nombre)
SELECT tm.id, categoria.nombre
FROM tbl_tipo_movimiento tm
JOIN (
  VALUES
    ('ingreso', 'salario'),
    ('ingreso', 'transferencia'),
    ('ingreso', 'otros_ingresos'),
    ('egreso',  'arriendo'),
    ('egreso',  'alimentacion'),
    ('egreso',  'transporte'),
    ('egreso',  'servicios'),
    ('egreso',  'otros_gastos')
) AS categoria(tipo, nombre) ON categoria.tipo = tm.nombre
WHERE NOT EXISTS (
  SELECT 1
  FROM tbl_categoria c
  WHERE c.id_tipo_movimiento = tm.id
    AND c.nombre = categoria.nombre
);
