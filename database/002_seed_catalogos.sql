-- SAGC · Datos iniciales no sensibles
USE sagc;

INSERT IGNORE INTO tipos_documento (clave, nombre)
VALUES
  ('CONSTANCIA', 'Constancia'),
  ('DIPLOMA', 'Diploma'),
  ('RECONOCIMIENTO', 'Reconocimiento'),
  ('ACREDITACION', 'Acreditación'),
  ('PERSONALIZADO', 'Otros / Personalizado');

UPDATE tipos_documento
SET activo = TRUE
WHERE clave IN (
  'CONSTANCIA',
  'DIPLOMA',
  'RECONOCIMIENTO',
  'ACREDITACION',
  'PERSONALIZADO'
);

-- Folio Único SAGC V1.
-- 0 representa que todavía no se ha emitido ningún folio del año.
-- La primera asignación será AAAA-A-0001.
INSERT IGNORE INTO contador_folios (anio, serie, ultimo_valor)
VALUES (YEAR(CURDATE()), 'A', 0);
