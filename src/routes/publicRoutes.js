const express = require("express");
const router = express.Router();
const publicMessagesController = require("../controllers/cfv/publicMessagesController");
const publicMessageCategoryController = require("../controllers/cfv/publicMessageCategoryController");
const authUserController = require("../controllers/authUserController");


// Mensajes publicos desde pagina institucional
router.post("/messages", publicMessagesController.createPublicMessage);
router.get("/messageCategories", publicMessageCategoryController.getAllMessagesCategoriesAsPublic);

// Proceso de login a portal clientes
router.post("/login", authUserController.login);
router.get("/refresh", authUserController.refreshToken);
router.get("/profile", authUserController.getProfile);
router.get("/logout", authUserController.logout);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /publicApi/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica usuarios y devuelve tokens de acceso y renovación
 *     tags:
 *       - Public API - LOGIN
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@empresa.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "miPassword123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     user_email:
 *                       type: string
 *                       example: "usuario@empresa.com"
 *                     user_role:
 *                       type: string
 *                       example: "owner"
 *                     company_id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Email y contraseña son requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email y password son requeridos"
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *       403:
 *         description: Usuario bloqueado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Contacte a su administrador"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /publicApi/refresh:
 *   get:
 *     summary: Renovar token de acceso
 *     description: Genera un nuevo token de acceso usando el refresh token válido
 *     tags:
 *       - Public API - LOGIN
 *     security: []
 *     parameters:
 *       - in: query
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de renovación
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2..."
 *       400:
 *         description: Refresh token es requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Refresh token es requerido"
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Refresh token inválido o expirado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /publicApi/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     description: Retorna la información del perfil del usuario autenticado
 *     tags:
 *       - Public API - LOGIN
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 user_complete_name:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 user_email:
 *                   type: string
 *                   example: "usuario@empresa.com"
 *                 user_role:
 *                   type: string
 *                   example: "owner"
 *                 company_id:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token inválido o expirado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /publicApi/logout:
 *   get:
 *     summary: Cerrar sesión
 *     description: Invalida el token de acceso actual del usuario
 *     tags:
 *       - Public API - LOGIN
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada exitosamente"
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token inválido o expirado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /publicApi/messageCategories:
 *   get:
 *     summary: Obtener categorías de mensajes
 *     description: Lista todas las categorías activas disponibles para clasificar mensajes públicos
 *     tags:
 *       - Public API - MENSAJES PUBLICOS
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: integer
 *                     example: 1
 *                   category_name:
 *                     type: string
 *                     example: "Consulta General"
 *                   category_status:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener las categorías"
 */

/**
 * @swagger
 * /publicApi/messages:
 *   post:
 *     summary: Crear mensaje público
 *     description: Permite a usuarios anónimos enviar mensajes de contacto desde el sitio web público
 *     tags:
 *       - Public API - MENSAJES PUBLICOS
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_email
 *               - message_phone
 *               - message_content
 *               - category_id
 *             properties:
 *               message_email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *               message_phone:
 *                 type: string
 *                 example: "+54 9 11 1234-5678"
 *               message_content:
 *                 type: string
 *                 example: "Hola, me gustaría obtener más información sobre sus servicios"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensaje creado correctamente"
 *       400:
 *         description: Campos obligatorios faltantes o categoría inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son obligatorios"
 *       404:
 *         description: Categoría no encontrada o inactiva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoría no válida o inactiva"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al crear el mensaje"
 */