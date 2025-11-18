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
const reclamoController = require("../controllers/reclamoController");
// =======================
// Middleware global para rutas protegidas
router.use(authSuperadmin);

// =======================
// Rutas protegidas


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
 *     summary: MENSAJES DE PLATAFORMA - Crear para empresa
 *     description: Crea un mensaje para para los owners de una empresa específica
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
 * /superApi/notifications/vapid-public-key:
 *   get:
 *     summary: NOTIFICACIONES PUSH - Obtener clave pública VAPID
 *     description: Obtiene la clave pública VAPID para configurar notificaciones push
 *     tags:
 *       - SuperAdmin API - PUSH
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clave pública VAPID obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *                   example: "BEl62iUYgUivxIkv69yViEuiBIa40HI8F7jW0JgCVv0X2f3xKqLz1DB1yFyR8uU0Pj8"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener la clave pública VAPID"
 */

/**
 * @swagger
 * /superApi/notifications/register-token:
 *   post:
 *     summary: NOTIFICACIONES PUSH - Registrar token
 *     description: Registra un token de dispositivo para recibir notificaciones push
 *     tags:
 *       - SuperAdmin API - PUSH
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: "* Token del dispositivo para notificaciones push"
 *                 example: "fGx2iUYgUivxIkv69yViEuiBIa40HI8F7jW0JgCVv0X2f3xKqLz1DB1yFyR8uU0Pj8"
 *     responses:
 *       200:
 *         description: Token registrado exitosamente
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
 *                   example: "Token registrado correctamente"
 *       400:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El token es requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al registrar el token"
 */

/**
 * @swagger
 * /superApi/notifications/send:
 *   post:
 *     summary: NOTIFICACIONES PUSH - Enviar notificación
 *     description: Envía una notificación push a dispositivos registrados
 *     tags:
 *       - SuperAdmin API - PUSH
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: "* Título de la notificación"
 *                 example: "Nueva actualización"
 *               body:
 *                 type: string
 *                 description: "* Cuerpo de la notificación"
 *                 example: "El sistema ha sido actualizado con nuevas funcionalidades"
 *               icon:
 *                 type: string
 *                 description: URL del icono de la notificación
 *                 example: "/icon.png"
 *               url:
 *                 type: string
 *                 description: URL a la que dirigir al hacer clic en la notificación
 *                 example: "/dashboard"
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
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
 *                   example: "Notificación enviada correctamente"
 *       400:
 *         description: Título y cuerpo son requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El título y cuerpo son requeridos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al enviar la notificación"
 */

/**
 * @swagger
 * /superApi/notifications/unregister-token:
 *   delete:
 *     summary: NOTIFICACIONES PUSH - Desregistrar token
 *     description: Desregistra un token de dispositivo para dejar de recibir notificaciones push
 *     tags:
 *       - SuperAdmin API - PUSH
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: "* Token del dispositivo a desregistrar"
 *                 example: "fGx2iUYgUivxIkv69yViEuiBIa40HI8F7jW0JgCVv0X2f3xKqLz1DB1yFyR8uU0Pj8"
 *     responses:
 *       200:
 *         description: Token desregistrado exitosamente
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
 *                   example: "Token desregistrado correctamente"
 *       400:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El token es requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al desregistrar el token"
 */

/**
 * @swagger
 * /superApi/notifications/unregister-specific-token:
 *   delete:
 *     summary: NOTIFICACIONES PUSH - Desregistrar token específico
 *     description: Desregistra un token específico de dispositivo para dejar de recibir notificaciones push
 *     tags:
 *       - SuperAdmin API - PUSH
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: "* Token específico del dispositivo a desregistrar"
 *                 example: "fGx2iUYgUivxIkv69yViEuiBIa40HI8F7jW0JgCVv0X2f3xKqLz1DB1yFyR8uU0Pj8"
 *     responses:
 *       200:
 *         description: Token específico desregistrado exitosamente
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
 *                   example: "Token específico desregistrado correctamente"
 *       400:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El token es requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al desregistrar el token específico"
 */