USE broker_db;

SELECT id, nombre, correo, google_sub, numero_documento
FROM tbl_persona
ORDER BY id DESC;

SELECT cb.id, p.correo, cb.tipo_cuenta, cb.saldo_disponible, cb.saldo_congelado
FROM tbl_cuenta_broker cb
JOIN tbl_persona p ON p.id = cb.id_persona
ORDER BY cb.id DESC;

SELECT cg.id, p.correo, cg.saldo
FROM tbl_cuenta_gestor cg
JOIN tbl_persona p ON p.id = cg.id_persona
ORDER BY cg.id DESC;
