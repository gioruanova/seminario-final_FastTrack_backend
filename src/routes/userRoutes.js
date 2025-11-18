const express = require("express");
const router = express.Router();

// middelware para usuarios
const authUserWithStatus = require("../middlewares/authUserWithStatus");

const userController = require("../controllers/userController");

const companyController = require("../controllers/companyController");
const companyConfigController = require("../controllers/companyConfigController");
const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");

const reclamoController = require("../controllers/reclamoController");
const clientesRecurrentesController = require("../controllers/clientesRecurrentesController");
const agendaReclamoController = require("../controllers/agendaReclamoController");
const disponibilidadController = require("../controllers/disponibilidadController");


// utilitarios
const exportProfesionalesController = require("../../utils/exports/exportProfesionalesController");
const exportReclamosController = require("../../utils/exports/exportReclamosController");
const notificationsController = require("../controllers/NotificationsController");

// =======================
// Rutas protegidas

// Manejo de company
router.get("/company/companyInfo", authUserWithStatus({ roles: ["owner"] }), companyController.getCompanyInfoAsClientForOnwer);
router.get("/company/companyStatus", authUserWithStatus({ roles: ["owner"] }), companyConfigController.getCompanySettingsByClientForOwner);
router.get("/company/config", authUserWithStatus({ roles: ["owner", "operador", "profesional"], skipCompanyCheck: true, }), companyConfigController.getCompanySettingsByClient);

router.put("/company", authUserWithStatus({ roles: ["owner"] }), companyController.updateCompanyAsClient);
router.put("/company/config", authUserWithStatus({ roles: ["owner"] }), companyConfigController.updateCompanySettingsByClient);

// Manejo de users
router.get("/users", authUserWithStatus({ roles: ["owner", "operador"] }), userController.getUsersAsClient);
router.put("/profile/manage", authUserWithStatus({ roles: ["owner", "operador", "profesional"] }), userController.manageProfile);

router.post("/users", authUserWithStatus({ roles: ["owner", "operador"] }), userController.createUserAsClient);
router.put("/users/:user_id", authUserWithStatus({ roles: ["owner", "operador"] }), userController.editUserAsClient);

router.post("/users/block/:user_id", authUserWithStatus({ roles: ["owner"] }), userController.blockUserAsClient);
router.post("/users/unblock/:user_id", authUserWithStatus({ roles: ["owner"] }), userController.unblockUserAsClient);
router.put("/users/restore/:user_id", authUserWithStatus({ roles: ["owner"] }), userController.restoreUserAsClient);

// --------------------------------------------------------------------------------------------------------------
// Manejo de especialidades
router.get("/especialidades", authUserWithStatus({ roles: ["owner", "operador"] }), especialidadController.getAllEspecialidades);

router.post("/especialidades", authUserWithStatus({ roles: ["owner"] }), especialidadController.createEspecialidadAsClient);
router.put("/especialidades/:especialidadId", authUserWithStatus({ roles: ["owner"] }), especialidadController.updateEspecialidadAsClient);

router.put("/especialidades/block/:especialidadId", authUserWithStatus({ roles: ["owner"] }), especialidadController.disableEspecialidadAsClient);
router.put("/especialidades/unblock/:especialidadId", authUserWithStatus({ roles: ["owner"] }), especialidadController.enableEspecialidadAsClient);

router.post("/profesionalEspecialidad", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.assignEspecialidadAsClient);

router.get("/asignaciones", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.getProfesionalEspecialidadAsClient);

router.delete("/profesionalEspecialidad/:id_asignacion", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.deleteEspecialidadAsClient);
router.put("/profesionalEspecialidad/:id_asignacion", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.editAsignacionEspecialidadAsClient);

// Manejo de clientes recurrentes
router.get("/clientes-recurrentes", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.getAllClientesRecurrentesAsClient);

router.post("/clientes-recurrentes", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.createClienteRecurrenteAsClient);

// TODO: Documentar endpoint
router.put("/clientes-recurrentes/:cliente_id", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.editarClienteAsClient);

// TODO: Documentar endpoint
router.put("/clientes-recurrentes/unblock/:cliente_id", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.activarClienteAsClient);

// TODO: Documentar endpoint
router.put("/clientes-recurrentes/block/:cliente_id", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.desactivarClienteAsClient);

router.get("/reclamos/agendaReclamo", authUserWithStatus({ roles: ["owner", "operador"] }), agendaReclamoController.getAgendaReclamo);
router.post("/disponibilidad/:user_id", authUserWithStatus({ roles: ["owner", "operador"] }), disponibilidadController.getDisponibilidadBloqueadaByProfesioanlAsAdmin);

// Reclamos como owner / operador
router.post("/reclamo", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.createReclamo);
router.get("/reclamos", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.getReclamosAsClient);
router.get("/reclamos/gestion/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.getReclamosAsClientById);
router.put("/reclamos/gestion/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.updateReclamoAsClient);

router.put("/reclamos/reminder/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.sendReminderToProfesional);

// Reclamos como profesional
router.get("/reclamos/profesional", authUserWithStatus({ roles: ["profesional"] }), reclamoController.getReclamosAsProfesional);
router.get("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus({ roles: ["profesional"] }), reclamoController.getReclamosAsProfesionalById);
router.put("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus({ roles: ["profesional"] }), reclamoController.updateReclamoAsProfesional);

// deshabilita/habilita la poisibilidad de recibir trabajo
router.get("/workload/estado", authUserWithStatus({ roles: ["profesional"] }), userController.getWorkloadState);
router.put("/workload/enable", authUserWithStatus({ roles: ["profesional"] }), userController.enableReceiveWork);
router.put("/workload/disable", authUserWithStatus({ roles: ["profesional"] }), userController.disableReceiveWork);

// --------------------------------------------------------------------------------------------------------------
// Manejo de features especiales
// VISTAS
router.get("/vistas/profesionales", authUserWithStatus({ roles: ["owner", "operador"] }), exportProfesionalesController.exportProfesionalesToExcel);
router.get("/vistas/reclamos/:status", authUserWithStatus({ roles: ["owner", "operador"] }), exportReclamosController.exportReclamosToExcel);


// =========================================================
// Notificaciones para mobile
router.post("/notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.registerToken);
router.post("/send-notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.sendNotification);


module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /customersApi/company/companyInfo:
 *   get:
 *     summary: EMPRESA - Obtener información (Owner)
 *     description: Obtiene la información completa de la empresa del usuario autenticado
 *     tags:
 *       - Customer API - EMPRESA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la empresa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_id:
 *                   type: integer
 *                   example: 1
 *                 company_nombre:
 *                   type: string
 *                   example: "Mi Empresa S.A."
 *                 company_phone:
 *                   type: string
 *                   example: "+54 9 11 1234-5678"
 *                 company_email:
 *                   type: string
 *                   example: "contacto@miempresa.com"
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
 * /customersApi/company/companyStatus:
 *   get:
 *     summary: EMPRESA - Obtener estado de configuración (Owner)
 *     description: Obtiene el estado de configuración de la empresa
 *     tags:
 *       - Customer API - EMPRESA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de configuración obtenido exitosamente
 *       404:
 *         description: Configuración de empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/company/config:
 *   get:
 *     summary: EMPRESA - Obtener configuración
 *     description: Obtiene la configuración de la empresa (disponible para todos los roles)
 *     tags:
 *       - Customer API - EMPRESA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *       404:
 *         description: Configuración de empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/company:
 *   put:
 *     summary: EMPRESA - Actualizar información (Owner)
 *     description: Actualiza la información de contacto de la empresa
 *     tags:
 *       - Customer API - EMPRESA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_phone:
 *                 type: string
 *                 description: Teléfono de la empresa
 *                 example: "+54 9 11 1234-5678"
 *               company_email:
 *                 type: string
 *                 format: email
 *                 description: Email de la empresa
 *                 example: "contacto@miempresa.com"
 *               company_whatsapp:
 *                 type: string
 *                 description: WhatsApp de la empresa
 *                 example: "+54 9 11 1234-5678"
 *               company_telegram:
 *                 type: string
 *                 description: Telegram de la empresa
 *                 example: "@miempresa"
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
 *       400:
 *         description: Campo no puede estar vacío o no se proporcionó ningún campo válido
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/company/config:
 *   put:
 *     summary: EMPRESA - Actualizar configuración (Owner)
 *     description: Actualiza la configuración de la empresa
 *     tags:
 *       - Customer API - EMPRESA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requiere_domicilio:
 *                 type: boolean
 *                 description: Requiere domicilio PARA USUARIO COMUN (CON SUS ROLES)es
 *                 example: true
 *               requiere_url:
 *                 type: boolean
 *                 description: Requiere URL en reclamos
 *                 example: false
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/users:
 *   get:
 *     summary: USUARIOS - Listar de la empresa
 *     description: Obtiene todos los usuarios de la empresa (Owner/Operador)
 *     tags:
 *       - Customer API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/users:
 *   post:
 *     summary: USUARIOS - Crear nuevo
 *     description: Crea un nuevo usuario en la empresa (Owner/Operador)
 *     tags:
 *       - Customer API - USUARIOS
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
 *                 enum: [operador, profesional]
 *                 description: "* Rol del usuario"
 *                 example: "profesional"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Email ya registrado o límite de usuarios alcanzado
 *       403:
 *         description: No tenés permiso para crear este tipo de usuario
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/users/{user_id}:
 *   put:
 *     summary: USUARIOS - Actualizar
 *     description: Actualiza la información de un usuario (Owner/Operador)
 *     tags:
 *       - Customer API - USUARIOS
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
 *                 example: "Juan Pérez Actualizado"
 *               user_dni:
 *                 type: string
 *                 example: "87654321"
 *               user_phone:
 *                 type: string
 *                 example: "+54 9 11 9876-5432"
 *               user_email:
 *                 type: string
 *                 example: "juan.nuevo@empresa.com"
 *               user_password:
 *                 type: string
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Usuario no existe o email/DNI ya registrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/users/block/{user_id}:
 *   post:
 *     summary: USUARIOS - Bloquear (Owner)
 *     description: Bloquea un usuario de la empresa
 *     tags:
 *       - Customer API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario bloqueado exitosamente
 *       400:
 *         description: Usuario no existe o ya bloqueado
 *       403:
 *         description: No tenés permiso para gestionar este usuario
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/users/unblock/{user_id}:
 *   post:
 *     summary: USUARIOS - Desbloquear (Owner)
 *     description: Desbloquea un usuario de la empresa
 *     tags:
 *       - Customer API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario desbloqueado exitosamente
 *       400:
 *         description: Usuario no existe o ya desbloqueado
 *       403:
 *         description: No tenés permiso para gestionar este usuario
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/users/restore/{user_id}:
 *   put:
 *     summary: USUARIOS - Restaurar con nueva contraseña (Owner)
 *     description: Restaura un usuario bloqueado estableciendo una nueva contraseña
 *     tags:
 *       - Customer API - USUARIOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
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
 *       400:
 *         description: Contraseña no provista o usuario ya habilitado
 *       403:
 *         description: No tenés permiso para gestionar este usuario
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/especialidades:
 *   get:
 *     summary: ESPECIALIDADES - Obtener asignaciones
 *     description: Obtiene especialidades de la empresa (Owner/Operador)
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de especialidades obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/especialidades:
 *   post:
 *     summary: ESPECIALIDADES - Crear nueva (Owner)
 *     description: Crea una nueva especialidad para la empresa
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
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
 *                 description: "* Nombre de la especialidad"
 *                 example: "Medicina General"
 *     responses:
 *       201:
 *         description: Especialidad creada exitosamente
 *       400:
 *         description: Campo requerido faltante o límite alcanzado
 *       409:
 *         description: La especialidad ya existe
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/especialidades/{especialidadId}:
 *   put:
 *     summary: ESPECIALIDADES - Actualizar (Owner)
 *     description: Actualiza el nombre de una especialidad
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: integer
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
 *                 description: "* Nuevo nombre"
 *                 example: "Medicina General Actualizada"
 *     responses:
 *       200:
 *         description: Especialidad actualizada exitosamente
 *       400:
 *         description: Campo requerido faltante
 *       404:
 *         description: Especialidad no encontrada
 *       409:
 *         description: Ya existe una especialidad con ese nombre
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/especialidades/block/{especialidadId}:
 *   put:
 *     summary: ESPECIALIDADES - Desactivar (Owner)
 *     description: Desactiva una especialidad
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Especialidad desactivada exitosamente
 *       400:
 *         description: Especialidad ya desactivada
 *       404:
 *         description: Especialidad no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/especialidades/unblock/{especialidadId}:
 *   put:
 *     summary: ESPECIALIDADES - Activar (Owner)
 *     description: Activa una especialidad previamente desactivada
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Especialidad activada exitosamente
 *       400:
 *         description: Especialidad ya activada
 *       404:
 *         description: Especialidad no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/profesionalEspecialidad:
 *   post:
 *     summary: ESPECIALIDADES - Asignar a profesional
 *     description: Asigna una especialidad a un profesional (Owner/Operador)
 *     tags:
 *       - Customer API - ESPECIALIDADES
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
 *       400:
 *         description: Campos requeridos faltantes o especialidad inactiva
 *       404:
 *         description: Profesional o especialidad no encontrados
 *       409:
 *         description: La especialidad ya está asignada
 *       500:
 *         description: Error al asignar la especialidad
 */

/**
 * @swagger
 * /customersApi/profesionalEspecialidad/{id_asignacion}:
 *   delete:
 *     summary: ESPECIALIDADES - Eliminar asignación
 *     description: Elimina la asignación de una especialidad (Owner/Operador)
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       201:
 *         description: Asignación eliminada exitosamente
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error al eliminar la asignación
 */

/**
 * @swagger
 * /customersApi/profesionalEspecialidad/{id_asignacion}:
 *   put:
 *     summary: ESPECIALIDADES - Editar asignación
 *     description: Edita la asignación cambiándola por otra especialidad (Owner/Operador)
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Asignación editada exitosamente
 *       400:
 *         description: ID requerido o especialidad inactiva
 *       404:
 *         description: Asignación o especialidad no encontrada
 *       409:
 *         description: La especialidad ya está asignada
 *       500:
 *         description: Error al editar la asignación
 */

/**
 * @swagger
 * /customersApi/clientes-recurrentes:
 *   get:
 *     summary: CLIENTES RECURRENTES - Listar
 *     description: Obtiene clientes recurrentes de la empresa (Owner/Operador)
 *     tags:
 *       - Customer API - CLIENTES RECURRENTES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/clientes-recurrentes:
 *   post:
 *     summary: CLIENTES RECURRENTES - Crear nuevo
 *     description: Crea un nuevo cliente recurrente (Owner/Operador)
 *     tags:
 *       - Customer API - CLIENTES RECURRENTES
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_complete_name
 *               - cliente_dni
 *               - cliente_phone
 *               - cliente_email
 *             properties:
 *               cliente_complete_name:
 *                 type: string
 *                 description: "* Nombre completo del cliente"
 *                 example: "María González"
 *               cliente_dni:
 *                 type: string
 *                 description: "* DNI del cliente"
 *                 example: "12345678"
 *               cliente_phone:
 *                 type: string
 *                 description: "* Teléfono del cliente"
 *                 example: "+54 9 11 1234-5678"
 *               cliente_email:
 *                 type: string
 *                 description: "* Email del cliente"
 *                 example: "maria@email.com"
 *               cliente_direccion:
 *                 type: string
 *                 description: Dirección del cliente
 *                 example: "Av. Corrientes 1234"
 *               cliente_lat:
 *                 type: number
 *                 nullable: true
 *                 description: Latitud (opcional)
 *                 example: -34.6037
 *               cliente_lng:
 *                 type: number
 *                 nullable: true
 *                 description: Longitud (opcional)
 *                 example: -58.3816
 *     responses:
 *       200:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Campos obligatorios faltantes o cliente ya existe
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/clientes-recurrentes/{cliente_id}:
 *   put:
 *     summary: CLIENTES RECURRENTES - Editar
 *     description: Edita la información de un cliente recurrente existente (Owner/Operador)
 *     tags:
 *       - Customer API - CLIENTES RECURRENTES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente recurrente
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_nombre
 *               - cliente_telefono
 *               - cliente_email
 *             properties:
 *               cliente_nombre:
 *                 type: string
 *                 description: "* Nombre completo del cliente"
 *                 example: "Juan Pérez"
 *               cliente_telefono:
 *                 type: string
 *                 description: "* Teléfono del cliente"
 *                 example: "+54 9 11 1234-5678"
 *               cliente_email:
 *                 type: string
 *                 format: email
 *                 description: "* Email del cliente"
 *                 example: "juan@ejemplo.com"
 *     responses:
 *       200:
 *         description: Cliente recurrente editado exitosamente
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
 *                   example: "Cliente recurrente editado correctamente"
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son requeridos"
 *       404:
 *         description: Cliente recurrente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente recurrente no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al editar el cliente recurrente"
 */

/**
 * @swagger
 * /customersApi/clientes-recurrentes/unblock/{cliente_id}:
 *   put:
 *     summary: CLIENTES RECURRENTES - Activar
 *     description: Activa un cliente recurrente previamente desactivado (Owner/Operador)
 *     tags:
 *       - Customer API - CLIENTES RECURRENTES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente recurrente
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente recurrente activado exitosamente
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
 *                   example: "Cliente recurrente activado correctamente"
 *       400:
 *         description: Cliente ya está activo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El cliente ya está activo"
 *       404:
 *         description: Cliente recurrente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente recurrente no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al activar el cliente recurrente"
 */

/**
 * @swagger
 * /customersApi/clientes-recurrentes/block/{cliente_id}:
 *   put:
 *     summary: CLIENTES RECURRENTES - Desactivar
 *     description: Desactiva un cliente recurrente del sistema (Owner/Operador)
 *     tags:
 *       - Customer API - CLIENTES RECURRENTES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente recurrente
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente recurrente desactivado exitosamente
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
 *                   example: "Cliente recurrente desactivado correctamente"
 *       400:
 *         description: Cliente ya está desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El cliente ya está desactivado"
 *       404:
 *         description: Cliente recurrente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente recurrente no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al desactivar el cliente recurrente"
 */

/**
 * @swagger
 * /customersApi/disponibilidad/{user_id}:
 *   post:
 *     summary: DISPONIBILIDAD - Obtener disponibilidad por profesional
 *     description: Obtiene la disponibilidad bloqueada de un profesional (Owner/Operador)
 *     tags:
 *       - Customer API - DISPONIBILIDAD
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamo:
 *   post:
 *     summary: RECLAMOS - Crear nuevo
 *     description: Crea un nuevo reclamo (Owner/Operador)
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reclamo_titulo
 *               - reclamo_detalle
 *               - profesional_id
 *               - especialidad_id
 *               - cliente_id
 *               - agenda_fecha
 *               - agenda_hora_desde
 *             properties:
 *               reclamo_titulo:
 *                 type: string
 *                 description: "* Título del reclamo"
 *                 example: "Instalación de sistema"
 *               reclamo_detalle:
 *                 type: string
 *                 description: "* Detalle del reclamo"
 *                 example: "Instalación completa del sistema"
 *               profesional_id:
 *                 type: integer
 *                 description: "* ID del profesional"
 *                 example: 1
 *               especialidad_id:
 *                 type: integer
 *                 description: "* ID de la especialidad"
 *                 example: 1
 *               cliente_id:
 *                 type: integer
 *                 description: "* ID del cliente"
 *                 example: 1
 *               agenda_fecha:
 *                 type: string
 *                 format: date
 *                 description: "* Fecha del reclamo"
 *                 example: "2024-01-15"
 *               agenda_hora_desde:
 *                 type: string
 *                 description: "* Hora de inicio"
 *                 example: "09:00"
 *               agenda_hora_hasta:
 *                 type: string
 *                 description: Hora de fin
 *                 example: "10:00"
 *               reclamo_url:
 *                 type: string
 *                 description: URL del reclamo
 *                 example: "https://ejemplo.com/reclamo"
 *     responses:
 *       201:
 *         description: Reclamo creado exitosamente
 *       400:
 *         description: Datos inválidos o especialidad no asignada
 *       500:
 *         description: Error creando reclamo
 */

/**
 * @swagger
 * /customersApi/reclamos:
 *   get:
 *     summary: RECLAMOS - Listar (Owner/Operador)
 *     description: Obtiene todos los reclamos de la empresa
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reclamos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/gestion/{reclamo_id}:
 *   get:
 *     summary: RECLAMOS - Obtener por ID (Owner/Operador)
 *     description: Obtiene los detalles de un reclamo específico
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reclamo obtenido exitosamente
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/gestion/{reclamo_id}:
 *   put:
 *     summary: RECLAMOS - Actualizar (Owner/Operador)
 *     description: Actualiza un reclamo específico
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reclamo_estado:
 *                 type: string
 *                 description: Estado del reclamo
 *                 example: "CERRADO"
 *               reclamo_nota_cierre:
 *                 type: string
 *                 description: Nota de cierre
 *                 example: "Trabajo completado satisfactoriamente"
 *               reclamo_presupuesto:
 *                 type: number
 *                 description: Presupuesto del reclamo
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Reclamo actualizado exitosamente
 *       400:
 *         description: Nota de cierre requerida para cerrar
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/profesional:
 *   get:
 *     summary: RECLAMOS - Listar asignados (Profesional)
 *     description: Obtiene los reclamos asignados al profesional
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reclamos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/profesional/gestion/{reclamo_id}:
 *   get:
 *     summary: RECLAMOS - Obtener por ID (Profesional)
 *     description: Obtiene los detalles de un reclamo asignado
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reclamo obtenido exitosamente
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/profesional/gestion/{reclamo_id}:
 *   put:
 *     summary: RECLAMOS - Actualizar (Profesional)
 *     description: Actualiza un reclamo asignado al profesional
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reclamo_estado:
 *                 type: string
 *                 example: "EN_PROGRESO"
 *               reclamo_nota_cierre:
 *                 type: string
 *                 example: "Trabajo iniciado"
 *               reclamo_presupuesto:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Reclamo actualizado exitosamente
 *       400:
 *         description: Nota de cierre requerida o reclamo ya cerrado
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/reminder/{reclamo_id}:
 *   put:
 *     summary: RECLAMOS - Enviar recordatorio a profesional (Owner/Operador)
 *     description: Envía un recordatorio al profesional asignado a un reclamo pendiente de atender
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclamo
 *         example: 123
 *     responses:
 *       200:
 *         description: Recordatorio enviado al profesional correctamente
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
 *                   example: "Recordatorio enviado al profesional correctamente"
 *       404:
 *         description: Reclamo o profesional no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Reclamo no encontrado"
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
 * /customersApi/workload/estado:
 *   get:
 *     summary: WORKLOAD - Obtener estado (Profesional)
 *     description: Obtiene el estado actual de disponibilidad para recibir trabajo
 *     tags:
 *       - Customer API - WORKLOAD
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/workload/enable:
 *   put:
 *     summary: WORKLOAD - Habilitar recepción de trabajo (Profesional)
 *     description: Habilita la recepción de nuevos trabajos
 *     tags:
 *       - Customer API - WORKLOAD
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recepción de trabajo habilitada
 *       400:
 *         description: El profesional ya estaba habilitado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/workload/disable:
 *   put:
 *     summary: WORKLOAD - Deshabilitar recepción de trabajo (Profesional)
 *     description: Deshabilita la recepción de nuevos trabajos
 *     tags:
 *       - Customer API - WORKLOAD
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recepción de trabajo deshabilitada
 *       400:
 *         description: El profesional ya estaba deshabilitado
 *       500:
 *         description: Error interno del servidor
 */




/**
 * @swagger
 * /customersApi/platform/feedback:
 *   post:
 *     summary: FEEDBACK - Enviar feedback
 *     description: Envía feedback a la plataforma (Todos los roles)
 *     tags:
 *       - Customer API - FEEDBACK
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_content
 *             properties:
 *               message_content:
 *                 type: string
 *                 description: "* Contenido del feedback"
 *                 example: "La plataforma funciona muy bien"
 *     responses:
 *       201:
 *         description: Feedback enviado exitosamente
 *       400:
 *         description: Contenido es requerido
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/messages:
 *   get:
 *     summary: MENSAJES DE PLATAFORMA - Listar
 *     description: Obtiene mensajes de la plataforma (Todos los roles)
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mensajes obtenidos exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/messages:
 *   post:
 *     summary: MENSAJES DE PLATAFORMA - Crear para empresa
 *     description: Crea un mensaje para toda la empresa (Owner/Operador)
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
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
 *                 example: "Reunión general"
 *               message_content:
 *                 type: string
 *                 description: "* Contenido del mensaje"
 *                 example: "Reunión mañana a las 10:00"
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente
 *       400:
 *         description: Título y contenido son requeridos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/messages/user/{user_id}:
 *   post:
 *     summary: MENSAJES DE PLATAFORMA - Crear para usuario
 *     description: Crea un mensaje para un usuario específico (Owner/Operador)
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: "Tarea asignada"
 *               message_content:
 *                 type: string
 *                 description: "* Contenido del mensaje"
 *                 example: "Tienes una nueva tarea"
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente
 *       400:
 *         description: Título y contenido son requeridos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/messages/{platform_message_id}:
 *   delete:
 *     summary: MENSAJES DE PLATAFORMA - Eliminar mensaje de empresa (Owner)
 *     description: Elimina un mensaje de la empresa
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform_message_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/single-message/{specific_message_id}:
 *   delete:
 *     summary: MENSAJES DE PLATAFORMA - Eliminar mensaje específico
 *     description: Elimina un mensaje específico (Todos los roles)
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specific_message_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/message/read/{specific_message_id}:
 *   put:
 *     summary: MENSAJES DE PLATAFORMA - Marcar como leído
 *     description: Marca un mensaje como leído (Todos los roles)
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specific_message_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje marcado como leído
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/platform/message/unread/{specific_message_id}:
 *   put:
 *     summary: MENSAJES DE PLATAFORMA - Marcar como no leído
 *     description: Marca un mensaje como no leído (Todos los roles)
 *     tags:
 *       - Customer API - MENSAJES DE PLATAFORMA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specific_message_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensaje marcado como no leído
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/vistas/profesionales:
 *   get:
 *     summary: EXPORTACIONES - Exportar profesionales a Excel
 *     description: Exporta la información de profesionales a Excel (Owner/Operador)
 *     tags:
 *       - Customer API - EXPORTACIONES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/vistas/reclamos/{status}:
 *   get:
 *     summary: EXPORTACIONES - Exportar reclamos a Excel
 *     description: Exporta la información de reclamos a Excel (Owner/Operador)
 *     tags:
 *       - Customer API - EXPORTACIONES
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Estado de los reclamos
 *         example: "PENDIENTE"
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/notifications/vapid-public-key:
 *   get:
 *     summary: NOTIFICACIONES PUSH - Obtener clave pública VAPID
 *     description: Obtiene la clave pública VAPID para configurar notificaciones push
 *     tags:
 *       - Customer API - PUSH
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
 * /customersApi/notifications/register-token:
 *   post:
 *     summary: NOTIFICACIONES PUSH - Registrar token
 *     description: Registra un token de dispositivo para recibir notificaciones push
 *     tags:
 *       - Customer API - PUSH
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
 * /customersApi/notifications/send:
 *   post:
 *     summary: NOTIFICACIONES PUSH - Enviar notificación
 *     description: Envía una notificación push a dispositivos registrados
 *     tags:
 *       - Customer API - PUSH
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
 * /customersApi/notifications/unregister-token:
 *   delete:
 *     summary: NOTIFICACIONES PUSH - Desregistrar token
 *     description: Desregistra un token de dispositivo para dejar de recibir notificaciones push
 *     tags:
 *       - Customer API - PUSH
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
 * /customersApi/notifications/unregister-specific-token:
 *   delete:
 *     summary: NOTIFICACIONES PUSH - Desregistrar token específico
 *     description: Desregistra un token específico de dispositivo para dejar de recibir notificaciones push
 *     tags:
 *       - Customer API - PUSH
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

/**
 * @swagger
 * /customersApi/asignaciones:
 *   get:
 *     summary: ESPECIALIDADES - Obtener asignaciones
 *     description: Obtiene todas las asignaciones de especialidades a profesionales de la empresa (Owner/Operador)
 *     tags:
 *       - Customer API - ESPECIALIDADES
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asignaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   profesional_id:
 *                     type: integer
 *                     description: ID del profesional
 *                     example: 123
 *                   profesional_nombre:
 *                     type: string
 *                     description: Nombre completo del profesional
 *                     example: "Juan Pérez"
 *                   especialidad_id:
 *                     type: integer
 *                     description: ID de la especialidad
 *                     example: 456
 *                   especialidad_nombre:
 *                     type: string
 *                     description: Nombre de la especialidad
 *                     example: "Cardiología"
 *       400:
 *         description: Company ID no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /customersApi/reclamos/agendaReclamo:
 *   get:
 *     summary: RECLAMOS - Obtener agenda de reclamos
 *     description: Obtiene la agenda de reclamos de la empresa con información de profesionales y especialidades (Owner/Operador)
 *     tags:
 *       - Customer API - RECLAMOS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agenda de reclamos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   profesional_id:
 *                     type: integer
 *                     description: ID del profesional asignado
 *                     example: 123
 *                   especialidad_id:
 *                     type: integer
 *                     description: ID de la especialidad del reclamo
 *                     example: 456
 *                   agenda_fecha:
 *                     type: string
 *                     format: date
 *                     description: Fecha de la agenda
 *                     example: "2024-01-15"
 *                   agenda_hora_desde:
 *                     type: string
 *                     pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                     description: Hora de inicio de la agenda
 *                     example: "09:00"
 *                   agenda_hora_hasta:
 *                     type: string
 *                     pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                     description: Hora de fin de la agenda
 *                     example: "10:00"
 *       500:
 *         description: Error interno del servidor
 */
