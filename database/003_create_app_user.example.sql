-- EJEMPLO. NO guardes una contraseña real en este archivo.
-- 1) Copia estas sentencias a una pestaña nueva de Workbench.
-- 2) Reemplaza CAMBIAR_CONTRASENA_LOCAL.
-- 3) Ejecuta usando una cuenta administradora de MySQL.

CREATE USER IF NOT EXISTS 'sagc_app'@'localhost'
  IDENTIFIED BY 'CAMBIAR_CONTRASENA_LOCAL';

ALTER USER 'sagc_app'@'localhost'
  IDENTIFIED BY 'CAMBIAR_CONTRASENA_LOCAL';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON sagc.*
  TO 'sagc_app'@'localhost';

FLUSH PRIVILEGES;

-- Verificación:
SHOW GRANTS FOR 'sagc_app'@'localhost';
