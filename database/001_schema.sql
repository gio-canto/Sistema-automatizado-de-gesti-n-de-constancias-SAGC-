-- SAGC · Esquema inicial MySQL v0.1
-- Requiere MySQL 8.x
-- Ejecutar con una cuenta administradora desde MySQL Workbench.

CREATE DATABASE IF NOT EXISTS sagc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE sagc;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(180) NOT NULL,
  usuario VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  permiso ENUM('NORMAL', 'ADMIN') NOT NULL DEFAULT 'NORMAL',
  foto_url VARCHAR(500) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_usuario (usuario),
  KEY idx_usuarios_activo (activo),
  KEY idx_usuarios_permiso (permiso)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipos_documento (
  id_tipo_documento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave VARCHAR(50) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_tipo_documento),
  UNIQUE KEY uq_tipos_documento_clave (clave),
  UNIQUE KEY uq_tipos_documento_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS eventos (
  id_evento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(80) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  lugar VARCHAR(255) NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  id_responsable BIGINT UNSIGNED NULL,
  estado ENUM('BORRADOR', 'ACTIVO', 'CERRADO', 'CANCELADO')
    NOT NULL DEFAULT 'BORRADOR',
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_evento),
  UNIQUE KEY uq_eventos_codigo (codigo),
  KEY idx_eventos_estado (estado),
  CONSTRAINT fk_eventos_responsable
    FOREIGN KEY (id_responsable) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campos_evento (
  id_campo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_evento BIGINT UNSIGNED NOT NULL,
  clave VARCHAR(80) NOT NULL,
  etiqueta VARCHAR(150) NOT NULL,
  tipo ENUM('TEXTO', 'TEXTO_LARGO', 'NUMERO', 'FECHA', 'BOOLEANO')
    NOT NULL DEFAULT 'TEXTO',
  requerido BOOLEAN NOT NULL DEFAULT FALSE,
  orden INT UNSIGNED NOT NULL DEFAULT 0,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_campo),
  UNIQUE KEY uq_campos_evento_clave (id_evento, clave),
  KEY idx_campos_evento_orden (id_evento, orden),
  CONSTRAINT fk_campos_evento_evento
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plantillas (
  id_plantilla BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tipo_documento BIGINT UNSIGNED NULL,
  nombre VARCHAR(180) NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  modo ENUM('TEMPORAL', 'REUTILIZABLE') NOT NULL DEFAULT 'REUTILIZABLE',
  orientacion ENUM('VERTICAL', 'HORIZONTAL') NOT NULL,
  tamano VARCHAR(50) NOT NULL,
  archivo_url VARCHAR(500) NOT NULL,
  miniatura_url VARCHAR(500) NULL,
  mime_type VARCHAR(100) NULL,
  ancho_px INT UNSIGNED NULL,
  alto_px INT UNSIGNED NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por BIGINT UNSIGNED NULL,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_plantilla),
  UNIQUE KEY uq_plantillas_nombre_version (nombre, version),
  KEY idx_plantillas_tipo_activo (id_tipo_documento, activo),
  CONSTRAINT fk_plantillas_tipo
    FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo_documento)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_plantillas_usuario
    FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contador_folios (
  serie VARCHAR(30) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  ultimo_valor BIGINT UNSIGNED NOT NULL DEFAULT 0,
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (serie, anio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS constancias (
  id_constancia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_evento BIGINT UNSIGNED NOT NULL,
  id_tipo_documento BIGINT UNSIGNED NOT NULL,
  id_plantilla BIGINT UNSIGNED NULL,
  nombre_persona VARCHAR(220) NOT NULL,
  datos_variables JSON NULL,
  folio VARCHAR(100) NOT NULL,
  token_unico VARCHAR(160) NOT NULL,
  cadena_validacion TEXT NOT NULL,
  hash_documento CHAR(64) NULL,
  qr_destino VARCHAR(600) NOT NULL,
  fecha_emision DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  emitido_por BIGINT UNSIGNED NOT NULL,
  estado ENUM('EMITIDA', 'CANCELADA', 'REEXPEDIDA')
    NOT NULL DEFAULT 'EMITIDA',
  id_constancia_origen BIGINT UNSIGNED NULL,
  motivo_cancelacion VARCHAR(500) NULL,
  fecha_cancelacion DATETIME(3) NULL,
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_constancia),
  UNIQUE KEY uq_constancias_folio (folio),
  UNIQUE KEY uq_constancias_token (token_unico),
  KEY idx_constancias_evento (id_evento),
  KEY idx_constancias_nombre (nombre_persona),
  KEY idx_constancias_estado (estado),
  KEY idx_constancias_fecha (fecha_emision),
  CONSTRAINT fk_constancias_evento
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_constancias_tipo
    FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo_documento)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_constancias_plantilla
    FOREIGN KEY (id_plantilla) REFERENCES plantillas(id_plantilla)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_constancias_emisor
    FOREIGN KEY (emitido_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_constancias_origen
    FOREIGN KEY (id_constancia_origen) REFERENCES constancias(id_constancia)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario BIGINT UNSIGNED NULL,
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  id_entidad BIGINT UNSIGNED NULL,
  ip VARCHAR(45) NULL,
  metadata JSON NULL,
  fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_auditoria),
  KEY idx_auditoria_usuario_fecha (id_usuario, fecha),
  KEY idx_auditoria_entidad (entidad, id_entidad),
  CONSTRAINT fk_auditoria_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;
