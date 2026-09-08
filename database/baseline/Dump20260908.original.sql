-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: sagc
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campos_personalisados`
--

DROP TABLE IF EXISTS `campos_personalisados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campos_personalisados` (
  `id_campo` int NOT NULL AUTO_INCREMENT,
  `id_eventos` int NOT NULL,
  `proyecto` varchar(45) DEFAULT NULL,
  `área` varchar(45) DEFAULT NULL,
  `modalidad` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_campo`),
  UNIQUE KEY `id_campo_UNIQUE` (`id_campo`),
  UNIQUE KEY `id_eventos_UNIQUE` (`id_eventos`),
  CONSTRAINT `id_eventos` FOREIGN KEY (`id_eventos`) REFERENCES `eventos` (`ideventos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campos_personalisados`
--

LOCK TABLES `campos_personalisados` WRITE;
/*!40000 ALTER TABLE `campos_personalisados` DISABLE KEYS */;
/*!40000 ALTER TABLE `campos_personalisados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `constancia`
--

DROP TABLE IF EXISTS `constancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `constancia` (
  `id_constancia` int unsigned NOT NULL AUTO_INCREMENT,
  `id_evento` int unsigned NOT NULL,
  `id_plantilla` int unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `token` varchar(100) NOT NULL,
  `campos` json NOT NULL,
  `cadena` text NOT NULL,
  `fecha_generacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_constancia`),
  UNIQUE KEY `folio` (`folio`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constancia`
--

LOCK TABLES `constancia` WRITE;
/*!40000 ALTER TABLE `constancia` DISABLE KEYS */;
/*!40000 ALTER TABLE `constancia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contador_folios`
--

DROP TABLE IF EXISTS `contador_folios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contador_folios` (
  `idcontador_folios` int NOT NULL,
  `año` int NOT NULL,
  `generacion` varchar(10) DEFAULT NULL,
  `ultimo_número` int NOT NULL,
  PRIMARY KEY (`idcontador_folios`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contador_folios`
--

LOCK TABLES `contador_folios` WRITE;
/*!40000 ALTER TABLE `contador_folios` DISABLE KEYS */;
/*!40000 ALTER TABLE `contador_folios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `ideventos` int NOT NULL,
  `nombre_evento` varchar(255) NOT NULL,
  `creado_por` int NOT NULL,
  `fecha_de_creacion` datetime NOT NULL,
  PRIMARY KEY (`ideventos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas`
--

DROP TABLE IF EXISTS `plantillas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillas` (
  `idplantillas` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `archivo` varchar(500) NOT NULL,
  `tipo_archivo` varchar(50) NOT NULL,
  `ancho` int NOT NULL,
  `alto` int NOT NULL,
  `orientacion` varchar(20) NOT NULL,
  `tamaño_documento` varchar(20) NOT NULL,
  `creadapor` int NOT NULL,
  `activa` tinyint NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`idplantillas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas`
--

LOCK TABLES `plantillas` WRITE;
/*!40000 ALTER TABLE `plantillas` DISABLE KEYS */;
/*!40000 ALTER TABLE `plantillas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `texto`
--

DROP TABLE IF EXISTS `texto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `texto` (
  `id_texto` int NOT NULL,
  `id_evento` int NOT NULL,
  `encabezado` varchar(255) NOT NULL,
  `otorga` varchar(100) DEFAULT NULL,
  `tipo` varchar(100) NOT NULL,
  `cuerpo` text,
  `lugar_fecha` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_texto`),
  KEY `id_evento_idx` (`id_evento`),
  CONSTRAINT `id_evento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`ideventos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `texto`
--

LOCK TABLES `texto` WRITE;
/*!40000 ALTER TABLE `texto` DISABLE KEYS */;
/*!40000 ALTER TABLE `texto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `idUsuarios` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `usuario` varchar(45) NOT NULL,
  `pasword_hash` varchar(255) NOT NULL,
  `permisos` varchar(45) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `cuenta_activa` tinyint NOT NULL,
  `Fecha_Creacion` datetime DEFAULT NULL,
  PRIMARY KEY (`idUsuarios`),
  UNIQUE KEY `usuario_UNIQUE` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'sagc'
--

--
-- Dumping routines for database 'sagc'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-08 10:43:54