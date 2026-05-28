-- PostgreSQL-compatible schema for broker_db

CREATE TABLE IF NOT EXISTS tbl_tipo_documento (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_tipo_documento_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_estado_cuenta (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_estado_cuenta_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_estado_activo (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_estado_activo_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_estado_orden (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_estado_orden_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_tipo_movimiento (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_tipo_movimiento_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_categoria (
  id BIGSERIAL PRIMARY KEY,
  id_tipo_movimiento BIGINT NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_categoria_tipo_nombre UNIQUE (id_tipo_movimiento, nombre),
  CONSTRAINT fk_categoria_tipo_movimiento
    FOREIGN KEY (id_tipo_movimiento) REFERENCES tbl_tipo_movimiento (id)
);

CREATE TABLE IF NOT EXISTS tbl_tipo_activo (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_tipo_activo_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_tipo_orden (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_tipo_orden_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_tipo_operacion (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_tipo_operacion_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tbl_persona (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  correo VARCHAR(200) NOT NULL,
  google_sub VARCHAR(255) NULL,
  numero_telefonico VARCHAR(30) NULL,
  id_tipo_documento BIGINT NOT NULL,
  numero_documento VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_persona_correo UNIQUE (correo),
  CONSTRAINT uk_persona_google_sub UNIQUE (google_sub),
  CONSTRAINT uk_persona_documento UNIQUE (id_tipo_documento, numero_documento),
  CONSTRAINT fk_persona_tipo_documento
    FOREIGN KEY (id_tipo_documento) REFERENCES tbl_tipo_documento (id)
);

CREATE TABLE IF NOT EXISTS tbl_cuenta_gestor (
  id BIGSERIAL PRIMARY KEY,
  id_persona BIGINT NOT NULL,
  saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  id_estado_cuenta BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_cuenta_gestor_persona UNIQUE (id_persona),
  CONSTRAINT fk_cuenta_gestor_persona
    FOREIGN KEY (id_persona) REFERENCES tbl_persona (id),
  CONSTRAINT fk_cuenta_gestor_estado
    FOREIGN KEY (id_estado_cuenta) REFERENCES tbl_estado_cuenta (id)
);

CREATE TABLE IF NOT EXISTS tbl_cuenta_broker (
  id BIGSERIAL PRIMARY KEY,
  id_persona BIGINT NOT NULL,
  tipo_cuenta VARCHAR(10) NOT NULL DEFAULT 'demo' CHECK (tipo_cuenta IN ('demo', 'real')),
  saldo_disponible DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  saldo_congelado DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  saldo_inicial_demo DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
  id_estado_cuenta BIGINT NOT NULL,
  fecha_ultimo_reinicio TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_cuenta_broker_persona_tipo UNIQUE (id_persona, tipo_cuenta),
  CONSTRAINT fk_cuenta_broker_persona
    FOREIGN KEY (id_persona) REFERENCES tbl_persona (id),
  CONSTRAINT fk_cuenta_broker_estado
    FOREIGN KEY (id_estado_cuenta) REFERENCES tbl_estado_cuenta (id)
);

CREATE TABLE IF NOT EXISTS tbl_activo (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  simbolo VARCHAR(20) NOT NULL,
  id_tipo_activo BIGINT NOT NULL,
  id_estado_activo BIGINT NOT NULL,
  precio_actual DECIMAL(15,2) NOT NULL,
  mercado VARCHAR(80) NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_activo_simbolo UNIQUE (simbolo),
  CONSTRAINT fk_activo_tipo
    FOREIGN KEY (id_tipo_activo) REFERENCES tbl_tipo_activo (id),
  CONSTRAINT fk_activo_estado
    FOREIGN KEY (id_estado_activo) REFERENCES tbl_estado_activo (id)
);

CREATE TABLE IF NOT EXISTS tbl_historial_precios (
  id BIGSERIAL PRIMARY KEY,
  id_activo BIGINT NOT NULL,
  fecha TIMESTAMP NOT NULL,
  precio_apertura DECIMAL(15,2) NOT NULL,
  precio_maximo DECIMAL(15,2) NOT NULL,
  precio_minimo DECIMAL(15,2) NOT NULL,
  precio_cierre DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_historial_activo_fecha UNIQUE (id_activo, fecha),
  CONSTRAINT fk_historial_activo
    FOREIGN KEY (id_activo) REFERENCES tbl_activo (id)
);

CREATE TABLE IF NOT EXISTS tbl_analisis_fundamental_accion (
  id BIGSERIAL PRIMARY KEY,
  simbolo VARCHAR(20) NOT NULL,
  id_activo BIGINT NULL,
  nombre_empresa VARCHAR(200) NULL,
  descripcion TEXT NULL,
  mercado VARCHAR(80) NULL,
  moneda VARCHAR(10) NULL,
  pais VARCHAR(80) NULL,
  sector VARCHAR(120) NULL,
  industria VARCHAR(160) NULL,
  capitalizacion_mercado DECIMAL(24,2) NULL,
  ebitda DECIMAL(24,2) NULL,
  per_ratio DECIMAL(19,6) NULL,
  forward_per DECIMAL(19,6) NULL,
  peg_ratio DECIMAL(19,6) NULL,
  price_to_sales_ratio_ttm DECIMAL(19,6) NULL,
  price_to_book_ratio DECIMAL(19,6) NULL,
  ev_to_revenue DECIMAL(19,6) NULL,
  ev_to_ebitda DECIMAL(19,6) NULL,
  book_value DECIMAL(19,6) NULL,
  dividend_per_share DECIMAL(19,6) NULL,
  dividend_yield DECIMAL(19,6) NULL,
  eps DECIMAL(19,6) NULL,
  revenue_per_share_ttm DECIMAL(19,6) NULL,
  profit_margin DECIMAL(19,6) NULL,
  operating_margin_ttm DECIMAL(19,6) NULL,
  return_on_assets_ttm DECIMAL(19,6) NULL,
  return_on_equity_ttm DECIMAL(19,6) NULL,
  revenue_ttm DECIMAL(24,2) NULL,
  gross_profit_ttm DECIMAL(24,2) NULL,
  diluted_eps_ttm DECIMAL(19,6) NULL,
  quarterly_earnings_growth_yoy DECIMAL(19,6) NULL,
  quarterly_revenue_growth_yoy DECIMAL(19,6) NULL,
  analyst_target_price DECIMAL(19,6) NULL,
  beta DECIMAL(19,6) NULL,
  week_52_high DECIMAL(19,6) NULL,
  week_52_low DECIMAL(19,6) NULL,
  moving_average_50_day DECIMAL(19,6) NULL,
  moving_average_200_day DECIMAL(19,6) NULL,
  shares_outstanding DECIMAL(24,2) NULL,
  dividend_date VARCHAR(20) NULL,
  ex_dividend_date VARCHAR(20) NULL,
  fecha_actualizacion TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_analisis_fundamental_simbolo UNIQUE (simbolo),
  CONSTRAINT fk_analisis_fundamental_activo
    FOREIGN KEY (id_activo) REFERENCES tbl_activo (id)
);

CREATE TABLE IF NOT EXISTS tbl_posicion (
  id BIGSERIAL PRIMARY KEY,
  id_cuenta_broker BIGINT NOT NULL,
  id_activo BIGINT NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  precio_promedio DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_posicion_cuenta_activo UNIQUE (id_cuenta_broker, id_activo),
  CONSTRAINT fk_posicion_cuenta_broker
    FOREIGN KEY (id_cuenta_broker) REFERENCES tbl_cuenta_broker (id),
  CONSTRAINT fk_posicion_activo
    FOREIGN KEY (id_activo) REFERENCES tbl_activo (id)
);

CREATE TABLE IF NOT EXISTS tbl_orden (
  id BIGSERIAL PRIMARY KEY,
  id_cuenta_broker BIGINT NOT NULL,
  id_activo BIGINT NOT NULL,
  id_estado_orden BIGINT NOT NULL,
  id_tipo_orden BIGINT NOT NULL,
  id_tipo_operacion BIGINT NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  precio_referencia DECIMAL(15,2) NOT NULL,
  precio_ejecucion DECIMAL(15,2) NULL,
  valor_total DECIMAL(15,2) NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ejecucion TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
);

CREATE TABLE IF NOT EXISTS tbl_movimiento (
  id BIGSERIAL PRIMARY KEY,
  id_cuenta_gestor BIGINT NOT NULL,
  id_categoria BIGINT NOT NULL,
  cantidad DECIMAL(15,2) NOT NULL,
  descripcion VARCHAR(200) NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movimiento_cuenta_gestor
    FOREIGN KEY (id_cuenta_gestor) REFERENCES tbl_cuenta_gestor (id),
  CONSTRAINT fk_movimiento_categoria
    FOREIGN KEY (id_categoria) REFERENCES tbl_categoria (id)
);
