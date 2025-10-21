const express = require("express");
const router = express.Router();

// middleware
const authSuperadmin = require("../middlewares/authSuperadmin");

// controllers
const userController = require("../controllers/userController");
const companyController = require("../controllers/companyController");
const clienteRecurrenteController = require("../controllers/clientesRecurrentesController");
const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");

const publicMessagesController = require("../controllers/cfv/publicMessagesController");
const publicMessageCategoryController = require("../controllers/cfv/publicMessageCategoryController");

const reclamoController = require("../controllers/reclamoController");

const globalLogController = require("../controllers/globalLogController");
const messageController = require("../controllers/messageController");
const siteBannerController = require("../controllers/siteBannerController");

// =======================
// Middleware global para rutas protegidas
router.use(authSuperadmin);

// =======================
// Rutas protegidas

router.get("/banners", siteBannerController.getBannersAsAdmin);
router.post("/banners", siteBannerController.createBanner);
router.put("/banners/:banner_id", siteBannerController.editBanner);
router.delete("/banners/:banner_id", siteBannerController.deleteBanner);
router.post("/banners/enable/:banner_id", siteBannerController.enableBanner);
router.post("/banners/disable/:banner_id", siteBannerController.disableBanner);

// Mensajes publicos
router.get("/messages", publicMessagesController.gettAlMessagesAsAdmin);
router.put("/messages/read/:message_id", publicMessagesController.markMessageAsReadAsAdmin);
router.put("/messages/unread/:message_id", publicMessagesController.markMessageAsUnreadAsAdmin);
router.delete("/messages/:message_id", publicMessagesController.deleteMessageAsAdmin);

// Categorias mensajes publicos
router.get("/messageCategories", publicMessageCategoryController.getAllMessagesCategoriesAsAdmin);
router.post("/messageCategories", publicMessageCategoryController.createMessageCategoryAsAdmin);
router.put("/messageCategories/:category_id", publicMessageCategoryController.updateMessageCategoryAsAdmin);
router.put("/messageCategories/disable/:category_id", publicMessageCategoryController.disableMessageCategoryAsAdmin);
router.put("/messageCategories/enable/:category_id", publicMessageCategoryController.enableMessageCategoryAsAdmin);
router.delete("/messageCategories/:category_id", publicMessageCategoryController.deleteCategoryMessageAsAdmin);

// Manejo de users
router.get("/users", userController.getUsersAsAdmin);
router.get("/users/:company_id", userController.getUsersByCompanyAsAdmin);

router.post("/users", userController.createUserAsAdmin);
router.put("/users/:user_id", userController.editUserAsAdmin);

router.post("/users/block/:user_id", userController.blockUserAsAdmin);
router.post("/users/unblock/:user_id", userController.unblockUserAsAdmin);
router.put("/users/restore/:user_id", userController.restoreUserAsAdmin);

// --------------------------------------------------------------------------------------------------------------
// Manejo de especialidades
router.get("/especialidades", especialidadController.getAllEspecialidadesAsAdmin);
router.get("/especialidades/:company_id", especialidadController.getAllEspecialidadesByCompanyAsAdmin);

router.post("/especialidades", especialidadController.createEspecialidadAsAdmin);
router.put("/especialidades/:especialidadId", especialidadController.updateEspecialidadAsAdmin);

router.put("/especialidades/block/:especialidadId", especialidadController.disableEspecialidadAsAdmin);
router.put("/especialidades/unblock/:especialidadId", especialidadController.enableEspecialidadAsAdmin);

router.post("/profesionalEspecialidad", profesionalEspecialidadController.assignEspecialidadAsAdmin);
router.delete("/profesionalEspecialidad/:id_asignacion", profesionalEspecialidadController.deleteEspecialidadAsAdmin);
router.put("/profesionalEspecialidad/:id_asignacion", profesionalEspecialidadController.editAsignacionEspecialidadAsAdmin);

// --------------------------------------------------------------------------------------------------------------
// Manejo de clientes recurrentes
// --------------------------------------------------------------------------------------------------------------
router.get("/clientes-recurrentes", clienteRecurrenteController.getAllClientesRecurrentesAsAdmin);

// Manejo de empresas
router.get("/companies", companyController.getAllCompanies);
router.post("/companies/:company_id", companyController.getCompanyById);

router.post("/companies", companyController.createCompany);
router.put("/companies/:company_id", companyController.updateCompanyAsAdmin);

// --------------------------------------------------------------------------------------------------------------
// Reclamos
router.get("/reclamos", reclamoController.getReclamosAsAdmin);
router.get("/reclamos/:company_id", reclamoController.getReclamosByCompanyAsAdmin);

// --------------------------------------------------------------------------------------------------------------
// Manejo de Logs
router.get("/globalLogs", globalLogController.getAllLogsAsAdmin);
router.get("/globalLogs/:company_id", globalLogController.getAllLogsByCompanyAsAdmin);

// Mensajes globales
router.post("/platform/messages", messageController.createMessageForAllAsAdmin);
router.post("/platform/messages/company/:company_id", messageController.createMessageForCompanyAsAdmin);
router.post("/platform/messages/user/:user_id", messageController.createMessageForUserAsAdmin);
router.delete("/platform/messages/:platform_message_id", messageController.deleteMessageAsAdmin);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /superApi/companies:
 *   get:
 *     summary: EMPRESAS - Listar todas
 *     description: Obtiene todas las empresas del sistema con sus usuarios y especialidades
 *     tags:
 *       - SuperAdmin API - EMPRESAS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company_id:
 *                     type: integer
 *                     example: 1
 *                   company_unique_id:
 *                     type: string
 *                     example: "COMP001"
 *                   company_nombre:
 *                     type: string
 *                     example: "Empresa Demo S.A."
 *                   company_phone:
 *                     type: string
 *                     example: "+54 9 11 1234-5678"
 *                   company_email:
 *                     type: string
 *                     example: "contacto@empresademo.com"
 *                   company_estado:
 *                     type: boolean
 *                     example: true
 *                   limite_operadores:
 *                     type: integer
 *                     example: 3
 *                   limite_profesionales:
 *                     type: integer
 *                     example: 10
 *                   limite_especialidades:
 *                     type: integer
 *                     example: 10
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
 * /superApi/companies/{company_id}:
 *   post:
 *     summary: EMPRESAS - Obtener por ID
 *     description: Obtiene la información detallada de una empresa específica con sus usuarios
 *     tags:
 *       - SuperAdmin API - EMPRESAS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     responses:
 *       200:
 *         description: Empresa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_id:
 *                   type: integer
 *                   example: 1
 *                 company_unique_id:
 *                   type: string
 *                   example: "COMP001"
 *                 company_nombre:
 *                   type: string
 *                   example: "Empresa Demo S.A."
 *                 company_phone:
 *                   type: string
 *                   example: "+54 9 11 1234-5678"
 *                 company_email:
 *                   type: string
 *                   example: "contacto@empresademo.com"
 *                 company_estado:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Empresa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Empresa no encontrada"
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
 * /superApi/companies:
 *   post:
 *     summary: EMPRESAS - Crear nueva
 *     description: Crea una nueva empresa en el sistema con su configuración inicial
 *     tags:
 *       - SuperAdmin API - EMPRESAS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_unique_id
 *               - company_nombre
 *               - company_phone
 *               - company_email
 *               - limite_operadores
 *               - limite_profesionales
 *               - reminder_manual
 *             properties:
 *               company_unique_id:
 *                 type: string
 *                 description: "* ID único de la empresa"
 *                 example: "COMP001"
 *               company_nombre:
 *                 type: string
 *                 description: "* Nombre de la empresa"
 *                 example: "Empresa Demo S.A."
 *               company_phone:
 *                 type: string
 *                 description: "* Teléfono de la empresa"
 *                 example: "+54 9 11 1234-5678"
 *               company_email:
 *                 type: string
 *                 format: email
 *                 description: "* Email de la empresa"
 *                 example: "contacto@empresademo.com"
 *               limite_operadores:
 *                 type: integer
 *                 description: "* Límite de operadores permitidos"
 *                 example: 3
 *               limite_profesionales:
 *                 type: integer
 *                 description: "* Límite de profesionales permitidos"
 *                 example: 10
 *               reminder_manual:
 *                 type: boolean
 *                 description: "* Habilitar recordatorios manuales"
 *                 example: false
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
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
 *                   example: "Empresa creada exitosamente"
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son requeridos"
 *       409:
 *         description: El company_unique_id o email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "El company_unique_id ya existe"
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
 * /superApi/companies/{company_id}:
 *   put:
 *     summary: EMPRESAS - Actualizar
 *     description: Actualiza la información de una empresa existente
 *     tags:
 *       - SuperAdmin API - EMPRESAS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_nombre:
 *                 type: string
 *                 description: Nombre de la empresa
 *                 example: "Empresa Demo S.A. Actualizada"
 *               company_phone:
 *                 type: string
 *                 description: Teléfono de la empresa
 *                 example: "+54 9 11 9876-5432"
 *               company_email:
 *                 type: string
 *                 format: email
 *                 description: Email de la empresa
 *                 example: "nuevo@empresademo.com"
 *               company_estado:
 *                 type: boolean
 *                 description: Estado de la empresa (activa/inactiva)
 *                 example: true
 *               limite_operadores:
 *                 type: integer
 *                 description: Límite de operadores permitidos
 *                 example: 5
 *               limite_profesionales:
 *                 type: integer
 *                 description: Límite de profesionales permitidos
 *                 example: 15
 *               limite_especialidades:
 *                 type: integer
 *                 description: Límite de especialidades permitidas
 *                 example: 15
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
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
 *                   example: "Empresa actualizada exitosamente"
 *       404:
 *         description: Empresa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Empresa no encontrada"
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
 * /superApi/users:
 *   get:
 *     summary: USUARIOS - Listar todos
 *     description: Obtiene todos los usuarios del sistema de todas las empresas
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   user_complete_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   user_dni:
 *                     type: string
 *                     example: "12345678"
 *                   user_phone:
 *                     type: string
 *                     example: "+54 9 11 1234-5678"
 *                   user_email:
 *                     type: string
 *                     example: "juan@empresa.com"
 *                   user_role:
 *                     type: string
 *                     example: "owner"
 *                   user_status:
 *                     type: integer
 *                     example: 1
 *                   company_id:
 *                     type: integer
 *                     example: 1
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
 * /superApi/users/{company_id}:
 *   get:
 *     summary: USUARIOS - Listar por empresa
 *     description: Obtiene todos los usuarios de una empresa específica
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de usuarios de la empresa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   user_complete_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   user_email:
 *                     type: string
 *                     example: "juan@empresa.com"
 *                   user_role:
 *                     type: string
 *                     example: "profesional"
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
 * /superApi/users:
 *   post:
 *     summary: USUARIOS - Crear nuevo
 *     description: Crea un nuevo usuario en el sistema y lo asigna a una empresa
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_complete_name
 *               - user_dni
 *               - user_phone
 *               - user_email
 *               - user_password
 *               - user_role
 *               - company_id
 *             properties:
 *               user_complete_name:
 *                 type: string
 *                 description: "* Nombre completo del usuario"
 *                 example: "Juan Pérez"
 *               user_dni:
 *                 type: string
 *                 description: "* DNI del usuario"
 *                 example: "12345678"
 *               user_phone:
 *                 type: string
 *                 description: "* Teléfono del usuario"
 *                 example: "+54 9 11 1234-5678"
 *               user_email:
 *                 type: string
 *                 format: email
 *                 description: "* Email del usuario"
 *                 example: "juan@empresa.com"
 *               user_password:
 *                 type: string
 *                 format: password
 *                 description: "* Contraseña del usuario"
 *                 example: "Password123!"
 *               user_role:
 *                 type: string
 *                 enum: [owner, operador, profesional]
 *                 description: "* Rol del usuario"
 *                 example: "profesional"
 *               company_id:
 *                 type: integer
 *                 description: "* ID de la empresa a la que pertenece"
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                   example: "Usuario creado correctamente"
 *       400:
 *         description: Empresa no existe, email o DNI ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El email o DNI ya está registrado"
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
 * /superApi/users/{user_id}:
 *   put:
 *     summary: USUARIOS - Actualizar
 *     description: Actualiza la información de un usuario existente
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_complete_name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez Actualizado"
 *               user_dni:
 *                 type: string
 *                 description: DNI del usuario
 *                 example: "87654321"
 *               user_phone:
 *                 type: string
 *                 description: Teléfono del usuario
 *                 example: "+54 9 11 9876-5432"
 *               user_email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: "juan.nuevo@empresa.com"
 *               user_password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña del usuario
 *                 example: "NuevaPassword123!"
 *               user_role:
 *                 type: string
 *                 enum: [owner, operador, profesional]
 *                 description: Rol del usuario
 *                 example: "operador"
 *               user_status:
 *                 type: integer
 *                 description: Estado del usuario (1=activo, 0=inactivo)
 *                 example: 1
 *               company_id:
 *                 type: integer
 *                 description: ID de la empresa
 *                 example: 1
 *     responses:
 *       200:
 *         description: Usuario editado exitosamente
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
 *                   example: "Usuario editado correctamente"
 *       400:
 *         description: Usuario no existe, campo vacío, email o DNI ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No existe usuario bajo ese ID"
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
 * /superApi/users/block/{user_id}:
 *   post:
 *     summary: USUARIOS - Bloquear
 *     description: Bloquea un usuario del sistema impidiendo su acceso
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a bloquear
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario bloqueado exitosamente
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
 *                   example: "Usuario bloqueado correctamente"
 *       400:
 *         description: Usuario no existe o ya estaba bloqueado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El usuario ya estaba bloqueado"
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
 * /superApi/users/unblock/{user_id}:
 *   post:
 *     summary: USUARIOS - Desbloquear
 *     description: Desbloquea un usuario del sistema permitiendo su acceso nuevamente
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a desbloquear
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario desbloqueado exitosamente
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
 *                   example: "Usuario desbloqueado correctamente"
 *       400:
 *         description: Usuario no existe o ya estaba desbloqueado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El usuario ya estaba desbloqueado"
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
 * /superApi/users/restore/{user_id}:
 *   put:
 *     summary: USUARIOS - Restaurar con nueva contraseña
 *     description: Restaura un usuario bloqueado y establece una nueva contraseña
 *     tags:
 *       - SuperAdmin API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a restaurar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *                 format: password
 *                 description: "* Nueva contraseña para el usuario"
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Usuario restaurado exitosamente
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
 *                   example: "Usuario restaurado correctamente"
 *       400:
 *         description: Usuario no existe, contraseña no provista o usuario ya habilitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Debes ingresar una nueva contraseña"
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
 * /superApi/especialidades:
 *   get:
 *     summary: ESPECIALIDADES - Listar todas
 *     description: Obtiene todas las especialidades del sistema de todas las empresas
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de especialidades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_especialidad:
 *                     type: integer
 *                     example: 1
 *                   nombre_especialidad:
 *                     type: string
 *                     example: "Medicina General"
 *                   company_id:
 *                     type: integer
 *                     example: 1
 *                   estado_especialidad:
 *                     type: integer
 *                     example: 1
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
 * /superApi/especialidades/{company_id}:
 *   get:
 *     summary: ESPECIALIDADES - Listar por empresa
 *     description: Obtiene todas las especialidades de una empresa específica
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de especialidades de la empresa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_especialidad:
 *                     type: integer
 *                     example: 1
 *                   nombre_especialidad:
 *                     type: string
 *                     example: "Medicina General"
 *                   company_id:
 *                     type: integer
 *                     example: 1
 *                   estado_especialidad:
 *                     type: integer
 *                     example: 1
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
 * /superApi/especialidades:
 *   post:
 *     summary: ESPECIALIDADES - Crear nueva
 *     description: Crea una nueva especialidad en el sistema para una empresa específica
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - nombre_especialidad
 *             properties:
 *               company_id:
 *                 type: integer
 *                 description: "* ID de la empresa"
 *                 example: 1
 *               nombre_especialidad:
 *                 type: string
 *                 description: "* Nombre de la especialidad"
 *                 example: "Medicina General"
 *     responses:
 *       201:
 *         description: Especialidad creada exitosamente
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
 *                   example: "Especialidad creada correctamente"
 *       400:
 *         description: Campos requeridos faltantes o empresa no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "nombre_especialidad y company_id son requeridos"
 *       409:
 *         description: La especialidad ya existe para esta empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La especialidad ya existe para esta empresa"
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
 * /superApi/especialidades/{especialidadId}:
 *   put:
 *     summary: ESPECIALIDADES - Actualizar
 *     description: Actualiza el nombre de una especialidad existente
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especialidad
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_especialidad
 *             properties:
 *               nombre_especialidad:
 *                 type: string
 *                 description: "* Nuevo nombre de la especialidad"
 *                 example: "Medicina General Actualizada"
 *     responses:
 *       200:
 *         description: Especialidad actualizada exitosamente
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
 *                   example: "Especialidad actualizada correctamente"
 *       400:
 *         description: Campo requerido faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El campo nombre_especialidad es requerido"
 *       404:
 *         description: Especialidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Especialidad no encontrada"
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
 * /superApi/especialidades/block/{especialidadId}:
 *   put:
 *     summary: ESPECIALIDADES - Desactivar
 *     description: Desactiva una especialidad del sistema
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especialidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Especialidad desactivada exitosamente
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
 *                   example: "Especialidad desactivada correctamente"
 *       400:
 *         description: Especialidad ya está desactivada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Especialidad ya esta desactivada"
 *       404:
 *         description: Especialidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Especialidad no encontrada"
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
 * /superApi/especialidades/unblock/{especialidadId}:
 *   put:
 *     summary: ESPECIALIDADES - Activar
 *     description: Activa una especialidad previamente desactivada
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especialidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Especialidad activada exitosamente
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
 *                   example: "Especialidad activada correctamente"
 *       400:
 *         description: Especialidad ya está activada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Especialidad ya esta activada"
 *       404:
 *         description: Especialidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Especialidad no encontrada"
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
 * /superApi/profesionalEspecialidad:
 *   post:
 *     summary: ESPECIALIDADES - Asignar a profesional
 *     description: Asigna una especialidad a un profesional
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profesional_id
 *               - especialidad_id
 *             properties:
 *               profesional_id:
 *                 type: integer
 *                 description: "* ID del profesional"
 *                 example: 1
 *               especialidad_id:
 *                 type: integer
 *                 description: "* ID de la especialidad"
 *                 example: 1
 *     responses:
 *       201:
 *         description: Especialidad asignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Especialidad asignada correctamente"
 *       400:
 *         description: Campos requeridos faltantes o especialidad inactiva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El profesional y la especialidad son requeridos"
 *       404:
 *         description: Profesional o especialidad no encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Profesional no encontrado"
 *       409:
 *         description: La especialidad ya está asignada al profesional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La especialidad ya esta asignada al profesional"
 *       500:
 *         description: Error al asignar la especialidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al asignar la especialidad"
 */

/**
 * @swagger
 * /superApi/profesionalEspecialidad/{id_asignacion}:
 *   delete:
 *     summary: ESPECIALIDADES - Eliminar asignación
 *     description: Elimina la asignación de una especialidad a un profesional
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación
 *         example: 1
 *     responses:
 *       201:
 *         description: Especialidad eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Especialidad eliminada correctamente"
 *       400:
 *         description: ID de asignación requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Es necesario el id de la asignacion"
 *       404:
 *         description: Asignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Asignacion de Especialidad-Profesional no encontrada"
 *       500:
 *         description: Error al eliminar la especialidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar la especialidad"
 */

/**
 * @swagger
 * /superApi/profesionalEspecialidad/{id_asignacion}:
 *   put:
 *     summary: ESPECIALIDADES - Editar asignación
 *     description: Edita la asignación de una especialidad cambiándola por otra
 *     tags:
 *       - SuperAdmin API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - especialidad_id
 *             properties:
 *               especialidad_id:
 *                 type: integer
 *                 description: "* ID de la nueva especialidad"
 *                 example: 2
 *     responses:
 *       201:
 *         description: Asignación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignacion actualizada correctamente"
 *       400:
 *         description: ID de especialidad requerido o especialidad inactiva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Es necesario el id de la especialidad"
 *       404:
 *         description: Asignación o especialidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Asignacion de Especialidad-Profesional no encontrada"
 *       409:
 *         description: La especialidad ya está asignada al profesional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La especialidad ya esta asignada al profesional"
 *       500:
 *         description: Error al actualizar la asignación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar la asignacion"
 */

/**
 * @swagger
 * /superApi/reclamos:
 *   get:
 *     summary: RECLAMOS - Listar todos
 *     description: Obtiene todos los reclamos del sistema de todas las empresas
 *     tags:
 *       - SuperAdmin API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reclamos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reclamo_id:
 *                     type: integer
 *                     example: 1
 *                   reclamo_titulo:
 *                     type: string
 *                     example: "Instalación de sistema"
 *                   reclamo_estado:
 *                     type: string
 *                     example: "PENDIENTE"
 *                   agenda_fecha:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   agenda_hora_desde:
 *                     type: string
 *                     example: "09:00"
 *                   cliente_complete_name:
 *                     type: string
 *                     example: "María González"
 *                   profesional:
 *                     type: string
 *                     example: "Juan Pérez"
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
 * /superApi/reclamos/{company_id}:
 *   get:
 *     summary: RECLAMOS - Listar por empresa
 *     description: Obtiene todos los reclamos de una empresa específica
 *     tags:
 *       - SuperAdmin API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de reclamos de la empresa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reclamo_id:
 *                     type: integer
 *                     example: 1
 *                   reclamo_titulo:
 *                     type: string
 *                     example: "Instalación de sistema"
 *                   reclamo_estado:
 *                     type: string
 *                     example: "PENDIENTE"
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
 * /superApi/clientes-recurrentes:
 *   get:
 *     summary: CLIENTES RECURRENTES - Listar todos
 *     description: Obtiene todos los clientes recurrentes del sistema de todas las empresas
 *     tags:
 *       - SuperAdmin API - CLIENTES RECURRENTES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes recurrentes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cliente_id:
 *                     type: integer
 *                     example: 1
 *                   cliente_nombre:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   cliente_telefono:
 *                     type: string
 *                     example: "+54 9 11 1234-5678"
 *                   cliente_email:
 *                     type: string
 *                     example: "juan@ejemplo.com"
 *                   cliente_estado:
 *                     type: boolean
 *                     example: true
 *                   company_id:
 *                     type: integer
 *                     example: 1
 *                   company_nombre:
 *                     type: string
 *                     example: "Empresa Demo S.A."
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los clientes recurrentes"
 */

/**
 * @swagger
 * /superApi/messages:
 *   get:
 *     summary: MENSAJES PÚBLICOS - Listar todos
 *     description: Obtiene todos los mensajes públicos recibidos desde el sitio web
 *     tags:
 *       - SuperAdmin API - MENSAJES PÚBLICOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes públicos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message_id:
 *                     type: integer
 *                     example: 1
 *                   message_email:
 *                     type: string
 *                     example: "usuario@ejemplo.com"
 *                   message_phone:
 *                     type: string
 *                     example: "+54 9 11 1234-5678"
 *                   message_content:
 *                     type: string
 *                     example: "Consulta sobre servicios"
 *                   message_source:
 *                     type: string
 *                     example: "WEB"
 *                   message_read:
 *                     type: boolean
 *                     example: false
 *                   category_name:
 *                     type: string
 *                     example: "Consulta General"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los mensajes"
 */

/**
 * @swagger
 * /superApi/messages/read/{message_id}:
 *   put:
 *     summary: MENSAJES PÚBLICOS - Marcar como leído
 *     description: Marca un mensaje público como leído
 *     tags:
 *       - SuperAdmin API - MENSAJES PÚBLICOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mensaje
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje marcado como leído exitosamente
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
 *                   example: "Mensaje marcado como leído"
 *       400:
 *         description: El mensaje ya está marcado como leído
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El mensaje ya está marcado como leído"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al marcar el mensaje como leído"
 */

/**
 * @swagger
 * /superApi/messages/unread/{message_id}:
 *   put:
 *     summary: MENSAJES PÚBLICOS - Marcar como no leído
 *     description: Marca un mensaje público como no leído
 *     tags:
 *       - SuperAdmin API - MENSAJES PÚBLICOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mensaje
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje marcado como no leído exitosamente
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
 *                   example: "Mensaje marcado como no leído"
 *       400:
 *         description: El mensaje ya está marcado como no leído
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El mensaje ya está marcado como no leído"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al marcar el mensaje como leído"
 */

/**
 * @swagger
 * /superApi/messages/{message_id}:
 *   delete:
 *     summary: MENSAJES PÚBLICOS - Eliminar
 *     description: Elimina un mensaje público del sistema
 *     tags:
 *       - SuperAdmin API - MENSAJES PÚBLICOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mensaje
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
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
 *                   example: "Mensaje eliminado correctamente"
 *       404:
 *         description: Mensaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mensaje no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el mensaje"
 */

/**
 * @swagger
 * /superApi/messageCategories:
 *   get:
 *     summary: CATEGORÍAS DE MENSAJES - Listar todas
 *     description: Obtiene todas las categorías de mensajes públicos del sistema
 *     tags:
 *       - SuperAdmin API - CATEGORÍAS DE MENSAJES
 *     security:
 *       - bearerAuth: []
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
 * /superApi/messageCategories:
 *   post:
 *     summary: CATEGORÍAS DE MENSAJES - Crear nueva
 *     description: Crea una nueva categoría para clasificar mensajes públicos
 *     tags:
 *       - SuperAdmin API - CATEGORÍAS DE MENSAJES
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 description: "* Nombre de la categoría"
 *                 example: "Soporte Técnico"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
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
 *                   example: "Categoría creada correctamente"
 *       400:
 *         description: Nombre de categoría es requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El nombre de la categoría es requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al crear la categoría"
 */

/**
 * @swagger
 * /superApi/messageCategories/{category_id}:
 *   put:
 *     summary: CATEGORÍAS DE MENSAJES - Actualizar
 *     description: Actualiza el nombre de una categoría de mensajes existente
 *     tags:
 *       - SuperAdmin API - CATEGORÍAS DE MENSAJES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 description: "* Nuevo nombre de la categoría"
 *                 example: "Soporte Técnico Avanzado"
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
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
 *                   example: "Categoría actualizada correctamente"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoría no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar la categoría"
 */

/**
 * @swagger
 * /superApi/messageCategories/disable/{category_id}:
 *   put:
 *     summary: CATEGORÍAS DE MENSAJES - Desactivar
 *     description: Desactiva una categoría de mensajes del sistema
 *     tags:
 *       - SuperAdmin API - CATEGORÍAS DE MENSAJES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría desactivada exitosamente
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
 *                   example: "Categoría desactivada correctamente"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoría no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al desactivar la categoría"
 */

/**
 * @swagger
 * /superApi/messageCategories/enable/{category_id}:
 *   put:
 *     summary: CATEGORÍAS DE MENSAJES - Activar
 *     description: Activa una categoría de mensajes previamente desactivada
 *     tags:
 *       - SuperAdmin API - CATEGORÍAS DE MENSAJES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría activada exitosamente
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
 *                   example: "Categoría activada correctamente"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoría no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al activar la categoría"
 */

/**
 * @swagger
 * /superApi/messageCategories/{category_id}:
 *   delete:
 *     summary: CATEGORÍAS DE MENSAJES - Eliminar
 *     description: Elimina una categoría de mensajes del sistema
 *     tags:
 *       - SuperAdmin API - CATEGORÍAS DE MENSAJES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
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
 *                   example: "Categoría eliminada correctamente"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoría no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar la categoría"
 */

/**
 * @swagger
 * /superApi/globalLogs:
 *   get:
 *     summary: LOGS GLOBALES - Listar todos
 *     description: Obtiene todos los logs globales del sistema de todas las empresas
 *     tags:
 *       - SuperAdmin API - LOGS GLOBALES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   log_id:
 *                     type: integer
 *                     example: 1
 *                   log_message:
 *                     type: string
 *                     example: "Usuario creado correctamente"
 *                   log_timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *                   company_id:
 *                     type: integer
 *                     example: 1
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
 * /superApi/globalLogs/{company_id}:
 *   get:
 *     summary: LOGS GLOBALES - Listar por empresa
 *     description: Obtiene todos los logs de una empresa específica
 *     tags:
 *       - SuperAdmin API - LOGS GLOBALES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de logs de la empresa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   log_id:
 *                     type: integer
 *                     example: 1
 *                   log_message:
 *                     type: string
 *                     example: "Usuario creado correctamente"
 *                   log_timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
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
 * /superApi/platform/messages:
 *   post:
 *     summary: MENSAJES DE PLATAFORMA - Crear para todas las empresas
 *     description: Crea un mensaje que se enviará a todas las empresas del sistema
 *     tags:
 *       - SuperAdmin API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_title
 *               - message_content
 *             properties:
 *               message_title:
 *                 type: string
 *                 description: "* Título del mensaje"
 *                 example: "Actualización del sistema"
 *               message_content:
 *                 type: string
 *                 description: "* Contenido del mensaje"
 *                 example: "El sistema se actualizará el próximo fin de semana"
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
 *         description: Título y contenido son requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El título y contenido son requeridos"
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

/**
 * @swagger
 * /superApi/platform/messages/company/{company_id}:
 *   post:
 *     summary: MENSAJES DE PLATAFORMA - Crear para empresa específica
 *     description: Crea un mensaje para todos los usuarios de una empresa específica
 *     tags:
 *       - SuperAdmin API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_title
 *               - message_content
 *             properties:
 *               message_title:
 *                 type: string
 *                 description: "* Título del mensaje"
 *                 example: "Recordatorio importante"
 *               message_content:
 *                 type: string
 *                 description: "* Contenido del mensaje"
 *                 example: "Recuerden actualizar su información de contacto"
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
 *         description: Título y contenido son requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El título y contenido son requeridos"
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

/**
 * @swagger
 * /superApi/platform/messages/user/{user_id}:
 *   post:
 *     summary: MENSAJES DE PLATAFORMA - Crear para usuario específico
 *     description: Crea un mensaje dirigido a un usuario específico
 *     tags:
 *       - SuperAdmin API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_title
 *               - message_content
 *             properties:
 *               message_title:
 *                 type: string
 *                 description: "* Título del mensaje"
 *                 example: "Mensaje personal"
 *               message_content:
 *                 type: string
 *                 description: "* Contenido del mensaje"
 *                 example: "Tienes una notificación importante"
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
 *         description: Título y contenido son requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El título y contenido son requeridos"
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

/**
 * @swagger
 * /superApi/platform/messages/{platform_message_id}:
 *   delete:
 *     summary: MENSAJES DE PLATAFORMA - Eliminar
 *     description: Elimina un mensaje de plataforma del sistema
 *     tags:
 *       - SuperAdmin API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform_message_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mensaje de plataforma
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
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
 *                   example: "Mensaje eliminado correctamente"
 *       404:
 *         description: Mensaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mensaje no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el mensaje"
 */


/**
 * @swagger
 * /superApi/banners:
 *   get:
 *     summary: BANNERS - Listar todos
 *     description: Obtiene todos los banners del sistema
 *     tags:
 *       - SuperAdmin API - BANNERS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de banners obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   banner_id:
 *                     type: integer
 *                     example: 1
 *                   banner_title:
 *                     type: string
 *                     example: "Banner Principal"
 *                   banner_content:
 *                     type: string
 *                     example: "Contenido del banner"
 *                   banner_status:
 *                     type: boolean
 *                     example: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los banners"
 */

/**
 * @swagger
 * /superApi/banners:
 *   post:
 *     summary: BANNERS - Crear nuevo
 *     description: Crea un nuevo banner en el sistema
 *     tags:
 *       - SuperAdmin API - BANNERS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - banner_title
 *               - banner_content
 *             properties:
 *               banner_title:
 *                 type: string
 *                 description: "* Título del banner"
 *                 example: "Banner Principal"
 *               banner_content:
 *                 type: string
 *                 description: "* Contenido del banner"
 *                 example: "Contenido del banner"
 *               banner_status:
 *                 type: boolean
 *                 description: Estado del banner (activo/inactivo)
 *                 example: true
 *     responses:
 *       201:
 *         description: Banner creado exitosamente
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
 *                   example: "Banner creado correctamente"
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El título y contenido son requeridos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al crear el banner"
 */

/**
 * @swagger
 * /superApi/banners/{banner_id}:
 *   put:
 *     summary: BANNERS - Actualizar
 *     description: Actualiza un banner existente
 *     tags:
 *       - SuperAdmin API - BANNERS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: banner_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del banner
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               banner_title:
 *                 type: string
 *                 description: Título del banner
 *                 example: "Banner Actualizado"
 *               banner_content:
 *                 type: string
 *                 description: Contenido del banner
 *                 example: "Contenido actualizado del banner"
 *               banner_status:
 *                 type: boolean
 *                 description: Estado del banner
 *                 example: true
 *     responses:
 *       200:
 *         description: Banner actualizado exitosamente
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
 *                   example: "Banner actualizado correctamente"
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Banner no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar el banner"
 */

/**
 * @swagger
 * /superApi/banners/{banner_id}:
 *   delete:
 *     summary: BANNERS - Eliminar
 *     description: Elimina un banner del sistema
 *     tags:
 *       - SuperAdmin API - BANNERS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: banner_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del banner
 *         example: 1
 *     responses:
 *       200:
 *         description: Banner eliminado exitosamente
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
 *                   example: "Banner eliminado correctamente"
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Banner no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el banner"
 */

/**
 * @swagger
 * /superApi/banners/enable/{banner_id}:
 *   post:
 *     summary: BANNERS - Activar
 *     description: Activa un banner del sistema
 *     tags:
 *       - SuperAdmin API - BANNERS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: banner_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del banner
 *         example: 1
 *     responses:
 *       200:
 *         description: Banner activado exitosamente
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
 *                   example: "Banner activado correctamente"
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Banner no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al activar el banner"
 */

/**
 * @swagger
 * /superApi/banners/disable/{banner_id}:
 *   post:
 *     summary: BANNERS - Desactivar
 *     description: Desactiva un banner del sistema
 *     tags:
 *       - SuperAdmin API - BANNERS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: banner_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del banner
 *         example: 1
 *     responses:
 *       200:
 *         description: Banner desactivado exitosamente
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
 *                   example: "Banner desactivado correctamente"
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Banner no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al desactivar el banner"
 */