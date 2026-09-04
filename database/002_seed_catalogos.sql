-- SAGC · Datos iniciales no sensibles
USE sagc;

INSERT INTO tipos_documento (clave, nombre)
VALUES
  ('CONSTANCIA', 'Constancia'),
  ('DIPLOMA', 'Diploma'),
  ('RECONOCIMIENTO', 'Reconocimiento'),
  ('ACREDITACION', 'Acreditación'),
  ('PERSONALIZADO', 'Otros / Personalizado')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  activo = TRUE;

INSERT INTO contador_folios (serie, anio, ultimo_valor)
VALUES ('FGRO', YEAR(CURDATE()), 0)
ON DUPLICATE KEY UPDATE
  ultimo_valor = ultimo_valor;
