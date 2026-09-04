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

INSERT IGNORE INTO contador_folios (serie, anio, ultimo_valor)
VALUES ('FGRO', YEAR(CURDATE()), 0);
