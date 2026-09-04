USE sagc;

SELECT DATABASE() AS base_actual, VERSION() AS version_mysql;

SHOW TABLES;

SELECT * FROM tipos_documento ORDER BY id_tipo_documento;

SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ENGINE,
  TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'sagc'
ORDER BY TABLE_NAME;
