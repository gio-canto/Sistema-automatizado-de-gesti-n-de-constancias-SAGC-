USE sagc;

SELECT DATABASE() AS base_actual, VERSION() AS version_mysql;

SHOW TABLES;

SELECT * FROM tipos_documento ORDER BY id_tipo_documento;

SELECT
  anio,
  serie,
  ultimo_valor,
  CASE
    WHEN ultimo_valor = 0 THEN CONCAT(anio, '-', serie, '-0001')
    WHEN ultimo_valor < 9999 THEN CONCAT(
      anio, '-', serie, '-', LPAD(ultimo_valor + 1, 4, '0')
    )
    WHEN serie < 'Z' THEN CONCAT(
      anio, '-', CHAR(ASCII(serie) + 1), '-0001'
    )
    ELSE 'FOLIOS_AGOTADOS'
  END AS siguiente_folio_estimado
FROM contador_folios
ORDER BY anio DESC;

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
