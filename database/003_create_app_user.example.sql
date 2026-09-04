-- EJEMPLO. NO guardes una contraseña real en este archivo.
-- 1) Copia estas sentencias a una pestaña nueva de Workbench.
-- 2) Reemplaza CAMBIAR_CONTRASENA_LOCAL.
-- 3) Ejecuta usando una cuenta administradora de MySQL.
--
-- Se usa 127.0.0.1 porque coincide con DB_HOST del backend local.

CREATE USER IF NOT EXISTS 'sagc_app'@'127.0.0.1'
  IDENTIFIED BY 'CAMBIAR_CONTRASENA_LOCAL';

ALTER USER 'sagc_app'@'127.0.0.1'
  IDENTIFIED BY 'CAMBIAR_CONTRASENA_LOCAL';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON sagc.*
  TO 'sagc_app'@'127.0.0.1';

FLUSH PRIVILEGES;

-- Verificación:
SHOW GRANTS FOR 'sagc_app'@'127.0.0.1';
