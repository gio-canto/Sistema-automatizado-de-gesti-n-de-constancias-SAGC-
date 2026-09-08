-- SAGC · Migración 001 · Folio Único V1
-- Convierte el contador anterior al formato oficial AAAA-X-XXXX.
--
-- PRECONDICIÓN:
--   No deben existir constancias emitidas con el formato de folio anterior.
--   Si existen, la migración se detiene para evitar alterar trazabilidad.
--
-- Después de esta migración:
--   contador_folios = anio + serie + ultimo_valor
--   constancias.folio = CHAR(11)
--
-- MySQL 8.x

USE sagc;

DELIMITER $$

DROP PROCEDURE IF EXISTS sagc_migrar_folio_unico_v1$$

CREATE PROCEDURE sagc_migrar_folio_unico_v1()
BEGIN
  DECLARE total_constancias BIGINT DEFAULT 0;

  SELECT COUNT(*)
    INTO total_constancias
  FROM constancias;

  IF total_constancias > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT =
        'Migración detenida: existen constancias emitidas. No convertir folios históricos automáticamente.';
  END IF;

  DROP TABLE IF EXISTS contador_folios_v1;

  CREATE TABLE contador_folios_v1 (
    anio SMALLINT UNSIGNED NOT NULL,
    serie CHAR(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
      NOT NULL DEFAULT 'A',
    ultimo_valor SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    fecha_actualizacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
      ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (anio),

    CONSTRAINT chk_contador_folios_v1_serie
      CHECK (serie >= 'A' AND serie <= 'Z'),

    CONSTRAINT chk_contador_folios_v1_valor
      CHECK (ultimo_valor BETWEEN 0 AND 9999)
  ) ENGINE=InnoDB;

  INSERT INTO contador_folios_v1 (anio, serie, ultimo_valor)
  SELECT
    c.anio,
    UPPER(COALESCE(NULLIF(c.generacion, ''), 'A')),
    c.ultimo_valor
  FROM contador_folios c
  INNER JOIN (
    SELECT
      anio,
      MAX(UPPER(COALESCE(NULLIF(generacion, ''), 'A'))) AS serie_actual
    FROM contador_folios
    GROUP BY anio
  ) actual
    ON actual.anio = c.anio
   AND actual.serie_actual =
       UPPER(COALESCE(NULLIF(c.generacion, ''), 'A'));

  DROP TABLE contador_folios;
  RENAME TABLE contador_folios_v1 TO contador_folios;

  ALTER TABLE constancias
    MODIFY folio CHAR(11) NOT NULL;

  INSERT IGNORE INTO contador_folios (anio, serie, ultimo_valor)
  VALUES (YEAR(CURDATE()), 'A', 0);
END$$

CALL sagc_migrar_folio_unico_v1()$$
DROP PROCEDURE sagc_migrar_folio_unico_v1$$

DELIMITER ;

SELECT
  anio,
  serie,
  ultimo_valor,
  CASE
    WHEN ultimo_valor = 0 THEN CONCAT(anio, '-', serie, '-0001')
    WHEN ultimo_valor < 9999 THEN
      CONCAT(anio, '-', serie, '-', LPAD(ultimo_valor + 1, 4, '0'))
    WHEN serie < 'Z' THEN
      CONCAT(anio, '-', CHAR(ASCII(serie) + 1), '-0001')
    ELSE 'FOLIOS_AGOTADOS'
  END AS siguiente_folio_estimado
FROM contador_folios
ORDER BY anio DESC;
