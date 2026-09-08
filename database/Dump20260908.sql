-- SAGC · Base de datos oficial
-- Archivo base: Dump20260908.sql
-- MySQL 8.x
--
-- Este archivo sustituye el diseño preliminar generado en Workbench el 08/09/2026.
-- Ya contiene la estructura corregida conforme al plan funcional original de SAGC.
--
-- IMPORTANTE:
--   * Este archivo es la fuente de verdad del esquema base.
--   * Para una instalación nueva puede ejecutarse completo.
--   * No contiene contraseñas reales ni datos personales.
--   * Folio Único SAGC V1 definido en docs/METODOLOGIA_FOLIO_UNICO.md.
--   * Cadena Original SAGC definida en docs/METODOLOGIA_CADENA_ORIGINAL.md.
--   * La metodología específica del token único continúa pendiente de aprobación.
--   * Las futuras modificaciones estructurales deberán hacerse mediante migrations/.
--
-- Convenciones:
--   * snake_case
--   * identificadores SQL sin acentos
--   * tablas en plural
--   * InnoDB
--   * utf8mb4
--   * claves foráneas explícitas
--   * folio y token únicos

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS sagc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE sagc;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------
-- Limpieza de una instalación de desarrollo previa
-- ---------------------------------------------------------------------
-- Si se ejecuta sobre una base con datos, estas sentencias eliminan las
-- tablas indicadas. Hacer respaldo antes de reconstruir el esquema.

DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS constancias;
DROP TABLE IF EXISTS contador_folios;
DROP TABLE IF EXISTS plantillas;
DROP TABLE IF EXISTS campos_evento;
DROP TABLE IF EXISTS textos_evento;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS tipos_documento;
DROP TABLE IF EXISTS usuarios;

-- Nombres preliminares usados en el primer modelo de Workbench.
DROP TABLE IF EXISTS constancia;
DROP TABLE IF EXISTS campos_personalisados;
DROP TABLE IF EXISTS texto;

-- ---------------------------------------------------------------------
-- 1. USUARIOS
-- ---------------------------------------------------------------------

CREATE TABLE usuarios (
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

-- ---------------------------------------------------------------------
-- 2. TIPOS DE DOCUMENTO
-- ---------------------------------------------------------------------

CREATE TABLE tipos_documento (
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

-- ---------------------------------------------------------------------
-- 3. EVENTOS
-- ---------------------------------------------------------------------

CREATE TABLE eventos (
  id_evento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(80) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  lugar VARCHAR(255) NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  creado_por BIGINT UNSIGNED NULL,
  id_responsable BIGINT UNSIGNED NULL,
  estado ENUM('BORRADOR', 'ACTIVO', 'CERRADO', 'CANCELADO')
    NOT NULL DEFAULT 'BORRADOR',
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id_evento),
  UNIQUE KEY uq_eventos_codigo (codigo),
  KEY idx_eventos_estado (estado),
  KEY idx_eventos_creado_por (creado_por),
  KEY idx_eventos_responsable (id_responsable),

  CONSTRAINT fk_eventos_creado_por
    FOREIGN KEY (creado_por)
    REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_eventos_responsable
    FOREIGN KEY (id_responsable)
    REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. TEXTOS DEL EVENTO / DOCUMENTO
-- ---------------------------------------------------------------------
-- Sustituye la tabla preliminar "texto".
-- Permite almacenar la configuración textual mostrada en la propuesta.

CREATE TABLE textos_evento (
  id_texto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_evento BIGINT UNSIGNED NOT NULL,
  encabezado VARCHAR(255) NOT NULL,
  otorga VARCHAR(100) NULL,
  tipo VARCHAR(100) NOT NULL,
  cuerpo TEXT NULL,
  lugar_fecha VARCHAR(255) NULL,
  configuracion JSON NULL,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id_texto),
  KEY idx_textos_evento (id_evento),

  CONSTRAINT fk_textos_evento_evento
    FOREIGN KEY (id_evento)
    REFERENCES eventos(id_evento)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. CAMPOS PERSONALIZADOS
-- ---------------------------------------------------------------------
-- Sustituye "campos_personalisados".
-- Proyecto, área y modalidad dejan de ser columnas rígidas y pasan a ser
-- campos configurables por evento.

CREATE TABLE campos_evento (
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
    FOREIGN KEY (id_evento)
    REFERENCES eventos(id_evento)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. PLANTILLAS
-- ---------------------------------------------------------------------

CREATE TABLE plantillas (
  id_plantilla BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tipo_documento BIGINT UNSIGNED NULL,
  nombre VARCHAR(180) NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  modo ENUM('TEMPORAL', 'REUTILIZABLE') NOT NULL DEFAULT 'REUTILIZABLE',
  archivo_url VARCHAR(500) NOT NULL,
  miniatura_url VARCHAR(500) NULL,
  mime_type VARCHAR(100) NULL,
  ancho_px INT UNSIGNED NULL,
  alto_px INT UNSIGNED NULL,
  orientacion ENUM('VERTICAL', 'HORIZONTAL') NOT NULL,
  tamano VARCHAR(50) NOT NULL,
  creado_por BIGINT UNSIGNED NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id_plantilla),
  UNIQUE KEY uq_plantillas_nombre_version (nombre, version),
  KEY idx_plantillas_tipo_activo (id_tipo_documento, activo),
  KEY idx_plantillas_creado_por (creado_por),

  CONSTRAINT fk_plantillas_tipo
    FOREIGN KEY (id_tipo_documento)
    REFERENCES tipos_documento(id_tipo_documento)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_plantillas_usuario
    FOREIGN KEY (creado_por)
    REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. CONTADOR DE FOLIOS
-- ---------------------------------------------------------------------
-- Folio Único SAGC V1: AAAA-X-XXXX
-- Cada año inicia en A-0001. Al llegar a X-9999 la siguiente emisión
-- avanza a la letra consecutiva y reinicia en 0001.
-- El backend debe bloquear esta fila con SELECT ... FOR UPDATE.

CREATE TABLE contador_folios (
  anio SMALLINT UNSIGNED NOT NULL,
  serie CHAR(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
    NOT NULL DEFAULT 'A',
  ultimo_valor SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (anio),

  CONSTRAINT chk_contador_folios_serie
    CHECK (serie >= 'A' AND serie <= 'Z'),

  CONSTRAINT chk_contador_folios_valor
    CHECK (ultimo_valor BETWEEN 0 AND 9999)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. CONSTANCIAS
-- ---------------------------------------------------------------------

CREATE TABLE constancias (
  id_constancia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_evento BIGINT UNSIGNED NOT NULL,
  id_tipo_documento BIGINT UNSIGNED NOT NULL,
  id_plantilla BIGINT UNSIGNED NULL,

  nombre_persona VARCHAR(220) NOT NULL,
  datos_variables JSON NULL,

  -- Folio Único SAGC V1: AAAA-X-XXXX (ej. 2026-A-0001)
  folio CHAR(11) NOT NULL,
  token_unico VARCHAR(160) NOT NULL,
  -- Cadena Original SAGC:
  -- FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
  -- El nombre del evento se obtiene de eventos.nombre a través de id_evento.
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
  KEY idx_constancias_tipo (id_tipo_documento),
  KEY idx_constancias_plantilla (id_plantilla),
  KEY idx_constancias_nombre (nombre_persona),
  KEY idx_constancias_estado (estado),
  KEY idx_constancias_fecha (fecha_emision),
  KEY idx_constancias_emisor (emitido_por),

  CONSTRAINT fk_constancias_evento
    FOREIGN KEY (id_evento)
    REFERENCES eventos(id_evento)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_constancias_tipo
    FOREIGN KEY (id_tipo_documento)
    REFERENCES tipos_documento(id_tipo_documento)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_constancias_plantilla
    FOREIGN KEY (id_plantilla)
    REFERENCES plantillas(id_plantilla)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_constancias_emisor
    FOREIGN KEY (emitido_por)
    REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_constancias_origen
    FOREIGN KEY (id_constancia_origen)
    REFERENCES constancias(id_constancia)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. AUDITORÍA
-- ---------------------------------------------------------------------

CREATE TABLE auditoria (
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
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Catálogos iniciales mínimos
-- ---------------------------------------------------------------------

INSERT INTO tipos_documento (clave, nombre)
VALUES
  ('CONSTANCIA', 'Constancia'),
  ('DIPLOMA', 'Diploma'),
  ('RECONOCIMIENTO', 'Reconocimiento'),
  ('ACREDITACION', 'Acreditación'),
  ('PERSONALIZADO', 'Otros / Personalizado');

INSERT INTO contador_folios (anio, serie, ultimo_valor)
VALUES (YEAR(CURDATE()), 'A', 0);

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- Fin de Dump20260908.sql