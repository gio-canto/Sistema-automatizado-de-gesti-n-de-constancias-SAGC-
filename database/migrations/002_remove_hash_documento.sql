-- SAGC · Migración 002
-- Elimina hash_documento porque el sistema no utilizará SHA-256
-- ni otra capa hash para la validación de constancias.
--
-- MySQL 8.x

USE sagc;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'sagc'
    AND TABLE_NAME = 'constancias'
    AND COLUMN_NAME = 'hash_documento'
);

SET @sql = IF(
  @column_exists > 0,
  'ALTER TABLE constancias DROP COLUMN hash_documento',
  'SELECT ''hash_documento no existe; no se requieren cambios.'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DESCRIBE constancias;
