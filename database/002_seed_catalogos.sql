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

-- Contador inicial de desarrollo.
-- El formato final del folio debe definirse con la metodología oficial.
INSERT IGNORE INTO contador_folios (serie, anio, generacion, ultimo_valor)
VALUES ('SAGC', YEAR(CURDATE()), 'A', 0);
