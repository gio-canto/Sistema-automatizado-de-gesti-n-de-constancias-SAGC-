USE sagc;

SELECT DATABASE() AS base_actual, VERSION() AS version_mysql;

SHOW TABLES;

SELECT * FROM tipos_documento ORDER BY id_tipo_documento;

SELECT
  serie,
  anio,
  generacion,
  ultimo_valor
FROM contador_folios
ORDER BY anio DESC, generacion, serie;

SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ENGINE,
  TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'sagc'
ORDER BY TABLE_NAME;

SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'sagc'
ORDER BY TABLE_NAME, CONSTRAINT_NAME;
