-- SAGC · Migración 001
-- Origen: Dump20260908.sql
-- Destino: esquema canónico database/001_schema.sql
-- MySQL 8.x
--
-- IMPORTANTE:
--   1. Hacer respaldo antes de ejecutar.
--   2. Esta migración está pensada para la estructura exacta del dump
--      generado el 08/09/2026.
--   3. No volver a ejecutar una vez completada.
--
-- El dump original contenía las tablas:
--   usuarios
--   eventos
--   texto
--   campos_personalisados
--   plantillas
--   contador_folios
--   constancia
--
-- Esta migración conserva la información y la transforma al modelo canónico.

USE sagc;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. Renombrar tablas originales para conservarlas durante la conversión
-- ---------------------------------------------------------------------

RENAME TABLE
  usuarios TO legacy_usuarios,
  eventos TO legacy_eventos,
  texto TO legacy_texto,
  campos_personalisados TO legacy_campos_personalisados,
  plantillas TO legacy_plantillas,
  contador_folios TO legacy_contador_folios,
  constancia TO legacy_constancia;

-- ---------------------------------------------------------------------
-- 2. Crear modelo canónico
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
  CONSTRAINT fk_eventos_creado_por
    FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_eventos_responsable
    FOREIGN KEY (id_responsable) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE textos_evento (
  id_texto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_evento BIGINT UNSIGNED NOT NULL,
  encabezado VARCHAR(255) NOT NULL,
  otorga VARCHAR(100) NULL,
  tipo VARCHAR(100) NOT NULL,
  cuerpo TEXT NULL,
  lugar_fecha VARCHAR(255) NULL,
  fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id_texto),
  KEY idx_textos_evento (id_evento),
  CONSTRAINT fk_textos_evento_evento
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

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
  CONSTRAINT fk_campos_evento_evento
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

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
  CONSTRAINT fk_plantillas_tipo
    FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo_documento)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_plantillas_usuario
    FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE contador_folios (
  serie VARCHAR(30) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  generacion VARCHAR(10) NOT NULL,
  ultimo_valor BIGINT UNSIGNED NOT NULL DEFAULT 0,
  fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (serie, anio, generacion)
) ENGINE=InnoDB;

CREATE TABLE constancias (
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
  qr_destino VARCHAR(600) NULL,
  fecha_emision DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  emitido_por BIGINT UNSIGNED NULL,
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
  CONSTRAINT fk_constancias_evento
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_constancias_tipo
    FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo_documento)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_constancias_plantilla
    FOREIGN KEY (id_plantilla) REFERENCES plantillas(id_plantilla)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_constancias_emisor
    FOREIGN KEY (emitido_por) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_constancias_origen
    FOREIGN KEY (id_constancia_origen) REFERENCES constancias(id_constancia)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

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
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Catálogos necesarios para migrar datos existentes
-- ---------------------------------------------------------------------

INSERT INTO tipos_documento (clave, nombre)
VALUES
  ('CONSTANCIA', 'Constancia'),
  ('DIPLOMA', 'Diploma'),
  ('RECONOCIMIENTO', 'Reconocimiento'),
  ('ACREDITACION', 'Acreditación'),
  ('PERSONALIZADO', 'Otros / Personalizado');

SET @TIPO_CONSTANCIA = (
  SELECT id_tipo_documento
  FROM tipos_documento
  WHERE clave = 'CONSTANCIA'
  LIMIT 1
);

-- ---------------------------------------------------------------------
-- 4. Migrar datos
-- ---------------------------------------------------------------------

INSERT INTO usuarios (
  id_usuario,
  nombre,
  usuario,
  password_hash,
  permiso,
  foto_url,
  activo,
  fecha_creacion
)
SELECT
  idUsuarios,
  nombre,
  usuario,
  pasword_hash,
  CASE
    WHEN UPPER(COALESCE(permisos, 'NORMAL')) = 'ADMIN' THEN 'ADMIN'
    ELSE 'NORMAL'
  END,
  foto,
  cuenta_activa <> 0,
  COALESCE(Fecha_Creacion, CURRENT_TIMESTAMP)
FROM legacy_usuarios;

INSERT INTO eventos (
  id_evento,
  codigo,
  nombre,
  creado_por,
  id_responsable,
  estado,
  fecha_creacion
)
SELECT
  e.ideventos,
  CONCAT('EVT-', LPAD(e.ideventos, 6, '0')),
  e.nombre_evento,
  u.id_usuario,
  u.id_usuario,
  'BORRADOR',
  COALESCE(e.fecha_de_creacion, CURRENT_TIMESTAMP)
FROM legacy_eventos e
LEFT JOIN usuarios u
  ON u.id_usuario = e.creado_por;

INSERT INTO textos_evento (
  id_texto,
  id_evento,
  encabezado,
  otorga,
  tipo,
  cuerpo,
  lugar_fecha
)
SELECT
  id_texto,
  id_evento,
  encabezado,
  otorga,
  tipo,
  cuerpo,
  lugar_fecha
FROM legacy_texto;

-- La tabla original guardaba proyecto/área/modalidad como columnas fijas.
-- El modelo nuevo las convierte en definiciones dinámicas por evento.
INSERT IGNORE INTO campos_evento (id_evento, clave, etiqueta, tipo, requerido, orden)
SELECT id_eventos, 'proyecto', 'Proyecto', 'TEXTO', FALSE, 10
FROM legacy_campos_personalisados
UNION ALL
SELECT id_eventos, 'area', 'Área', 'TEXTO', FALSE, 20
FROM legacy_campos_personalisados
UNION ALL
SELECT id_eventos, 'modalidad', 'Modalidad', 'TEXTO', FALSE, 30
FROM legacy_campos_personalisados;

INSERT INTO plantillas (
  id_plantilla,
  id_tipo_documento,
  nombre,
  version,
  modo,
  archivo_url,
  mime_type,
  ancho_px,
  alto_px,
  orientacion,
  tamano,
  creado_por,
  activo,
  fecha_creacion
)
SELECT
  p.idplantillas,
  @TIPO_CONSTANCIA,
  p.nombre,
  1,
  'REUTILIZABLE',
  p.archivo,
  p.tipo_archivo,
  NULLIF(p.ancho, 0),
  NULLIF(p.alto, 0),
  CASE
    WHEN UPPER(p.orientacion) LIKE 'HORIZ%' THEN 'HORIZONTAL'
    ELSE 'VERTICAL'
  END,
  p.`tamaño_documento`,
  u.id_usuario,
  p.activa <> 0,
  p.fecha_creacion
FROM legacy_plantillas p
LEFT JOIN usuarios u
  ON u.id_usuario = p.creadapor;

INSERT INTO contador_folios (
  serie,
  anio,
  generacion,
  ultimo_valor
)
SELECT
  'SAGC',
  `año`,
  COALESCE(NULLIF(generacion, ''), 'A'),
  `ultimo_número`
FROM legacy_contador_folios;

INSERT INTO constancias (
  id_constancia,
  id_evento,
  id_tipo_documento,
  id_plantilla,
  nombre_persona,
  datos_variables,
  folio,
  token_unico,
  cadena_validacion,
  fecha_emision,
  estado
)
SELECT
  id_constancia,
  id_evento,
  @TIPO_CONSTANCIA,
  id_plantilla,
  nombre,
  campos,
  folio,
  token,
  cadena,
  fecha_generacion,
  'EMITIDA'
FROM legacy_constancia;

-- Ajustar AUTO_INCREMENT después de conservar IDs históricos.
SET @next_usuario = (SELECT COALESCE(MAX(id_usuario), 0) + 1 FROM usuarios);
SET @sql_usuario = CONCAT('ALTER TABLE usuarios AUTO_INCREMENT = ', @next_usuario);
PREPARE stmt FROM @sql_usuario; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_evento = (SELECT COALESCE(MAX(id_evento), 0) + 1 FROM eventos);
SET @sql_evento = CONCAT('ALTER TABLE eventos AUTO_INCREMENT = ', @next_evento);
PREPARE stmt FROM @sql_evento; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_plantilla = (SELECT COALESCE(MAX(id_plantilla), 0) + 1 FROM plantillas);
SET @sql_plantilla = CONCAT('ALTER TABLE plantillas AUTO_INCREMENT = ', @next_plantilla);
PREPARE stmt FROM @sql_plantilla; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_constancia = (SELECT COALESCE(MAX(id_constancia), 0) + 1 FROM constancias);
SET @sql_constancia = CONCAT('ALTER TABLE constancias AUTO_INCREMENT = ', @next_constancia);
PREPARE stmt FROM @sql_constancia; EXECUTE stmt; DEALLOCATE PREPARE stmt;

COMMIT;

-- ---------------------------------------------------------------------
-- 5. Verificación
-- ---------------------------------------------------------------------

SELECT 'usuarios' AS tabla, COUNT(*) AS registros FROM usuarios
UNION ALL
SELECT 'eventos', COUNT(*) FROM eventos
UNION ALL
SELECT 'textos_evento', COUNT(*) FROM textos_evento
UNION ALL
SELECT 'campos_evento', COUNT(*) FROM campos_evento
UNION ALL
SELECT 'plantillas', COUNT(*) FROM plantillas
UNION ALL
SELECT 'contador_folios', COUNT(*) FROM contador_folios
UNION ALL
SELECT 'constancias', COUNT(*) FROM constancias;

-- ---------------------------------------------------------------------
-- 6. Las legacy_* se conservan de momento como respaldo.
--    No borrarlas hasta validar la migración desde Workbench.
-- ---------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
