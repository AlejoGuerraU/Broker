CREATE DATABASE IF NOT EXISTS broker_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE broker_db;

CREATE TABLE IF NOT EXISTS tbl_tipo_documento (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_documento_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_estado_cuenta (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_cuenta_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_estado_activo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_activo_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_estado_orden (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_orden_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_tipo_movimiento (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_movimiento_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_categoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tipo_movimiento BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categoria_tipo_nombre (id_tipo_movimiento, nombre),
  CONSTRAINT fk_categoria_tipo_movimiento
    FOREIGN KEY (id_tipo_movimiento) REFERENCES tbl_tipo_movimiento (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_tipo_activo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_activo_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_tipo_orden (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_orden_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_tipo_operacion (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_operacion_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_persona (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(200) NOT NULL,
  correo VARCHAR(200) NOT NULL,
  google_sub VARCHAR(255) NULL,
  numero_telefonico VARCHAR(30) NULL,
  id_tipo_documento BIGINT UNSIGNED NOT NULL,
  numero_documento VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_persona_correo (correo),
  UNIQUE KEY uk_persona_google_sub (google_sub),
  UNIQUE KEY uk_persona_documento (id_tipo_documento, numero_documento),
  CONSTRAINT fk_persona_tipo_documento
    FOREIGN KEY (id_tipo_documento) REFERENCES tbl_tipo_documento (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_cuenta_gestor (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_persona BIGINT UNSIGNED NOT NULL,
  saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  id_estado_cuenta BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cuenta_gestor_persona (id_persona),
  CONSTRAINT fk_cuenta_gestor_persona
    FOREIGN KEY (id_persona) REFERENCES tbl_persona (id),
  CONSTRAINT fk_cuenta_gestor_estado
    FOREIGN KEY (id_estado_cuenta) REFERENCES tbl_estado_cuenta (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_cuenta_broker (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_persona BIGINT UNSIGNED NOT NULL,
  tipo_cuenta ENUM('demo', 'real') NOT NULL DEFAULT 'demo',
  saldo_disponible DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  saldo_congelado DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  saldo_inicial_demo DECIMAL(15,2) NOT NULL DEFAULT 30000000.00,
  id_estado_cuenta BIGINT UNSIGNED NOT NULL,
  fecha_ultimo_reinicio DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cuenta_broker_persona_tipo (id_persona, tipo_cuenta),
  CONSTRAINT fk_cuenta_broker_persona
    FOREIGN KEY (id_persona) REFERENCES tbl_persona (id),
  CONSTRAINT fk_cuenta_broker_estado
    FOREIGN KEY (id_estado_cuenta) REFERENCES tbl_estado_cuenta (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_activo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(200) NOT NULL,
  simbolo VARCHAR(20) NOT NULL,
  id_tipo_activo BIGINT UNSIGNED NOT NULL,
  id_estado_activo BIGINT UNSIGNED NOT NULL,
  precio_actual DECIMAL(15,2) NOT NULL,
  mercado VARCHAR(80) NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'COP',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_activo_simbolo (simbolo),
  CONSTRAINT fk_activo_tipo
    FOREIGN KEY (id_tipo_activo) REFERENCES tbl_tipo_activo (id),
  CONSTRAINT fk_activo_estado
    FOREIGN KEY (id_estado_activo) REFERENCES tbl_estado_activo (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_historial_precios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_activo BIGINT UNSIGNED NOT NULL,
  fecha DATETIME NOT NULL,
  precio_apertura DECIMAL(15,2) NOT NULL,
  precio_maximo DECIMAL(15,2) NOT NULL,
  precio_minimo DECIMAL(15,2) NOT NULL,
  precio_cierre DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_historial_activo_fecha (id_activo, fecha),
  CONSTRAINT fk_historial_activo
    FOREIGN KEY (id_activo) REFERENCES tbl_activo (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_posicion (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cuenta_broker BIGINT UNSIGNED NOT NULL,
  id_activo BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  precio_promedio DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_posicion_cuenta_activo (id_cuenta_broker, id_activo),
  CONSTRAINT fk_posicion_cuenta_broker
    FOREIGN KEY (id_cuenta_broker) REFERENCES tbl_cuenta_broker (id),
  CONSTRAINT fk_posicion_activo
    FOREIGN KEY (id_activo) REFERENCES tbl_activo (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_orden (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cuenta_broker BIGINT UNSIGNED NOT NULL,
  id_activo BIGINT UNSIGNED NOT NULL,
  id_estado_orden BIGINT UNSIGNED NOT NULL,
  id_tipo_orden BIGINT UNSIGNED NOT NULL,
  id_tipo_operacion BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  precio_referencia DECIMAL(15,2) NOT NULL,
  precio_ejecucion DECIMAL(15,2) NULL,
  valor_total DECIMAL(15,2) NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ejecucion DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_orden_cuenta_broker
    FOREIGN KEY (id_cuenta_broker) REFERENCES tbl_cuenta_broker (id),
  CONSTRAINT fk_orden_activo
    FOREIGN KEY (id_activo) REFERENCES tbl_activo (id),
  CONSTRAINT fk_orden_estado
    FOREIGN KEY (id_estado_orden) REFERENCES tbl_estado_orden (id),
  CONSTRAINT fk_orden_tipo
    FOREIGN KEY (id_tipo_orden) REFERENCES tbl_tipo_orden (id),
  CONSTRAINT fk_orden_operacion
    FOREIGN KEY (id_tipo_operacion) REFERENCES tbl_tipo_operacion (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tbl_movimiento (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cuenta_gestor BIGINT UNSIGNED NOT NULL,
  id_categoria BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(15,2) NOT NULL,
  descripcion VARCHAR(200) NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_movimiento_cuenta_gestor
    FOREIGN KEY (id_cuenta_gestor) REFERENCES tbl_cuenta_gestor (id),
  CONSTRAINT fk_movimiento_categoria
    FOREIGN KEY (id_categoria) REFERENCES tbl_categoria (id)
) ENGINE=InnoDB;
