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
    SELECT 1
    FROM tbl_persona p
    WHERE p.correo = 'demo@broker.local'
  );

INSERT INTO tbl_cuenta_gestor (
  id_persona,
  saldo,
  id_estado_cuenta
)
SELECT
  p.id,
  0.00,
  ec.id
FROM tbl_persona p
JOIN tbl_estado_cuenta ec ON ec.nombre = 'activa'
WHERE p.correo = 'demo@broker.local'
  AND NOT EXISTS (
    SELECT 1
    FROM tbl_cuenta_gestor cg
    WHERE cg.id_persona = p.id
  );
