const express = require("express");
const router = express.Router();
const userController = require("../../controllers/UserController");
const authUsers = require("../../middlewares/authUsers");

router.get("/users", authUsers({ roles: ["superadmin", "owner", "operador"] }), userController.getUsers);
router.get("/users/:company_id", authUsers({ roles: ["superadmin"] }), userController.getUsersByCompany);
router.post("/users", authUsers({ roles: ["superadmin", "owner", "operador"] }), userController.createUser);
router.put("/users/:user_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), userController.updateUser);
router.post("/users/:user_id/block", authUsers({ roles: ["superadmin", "owner", "operador"] }), userController.blockUser);
router.post("/users/:user_id/unblock", authUsers({ roles: ["superadmin", "owner", "operador"] }), userController.unblockUser);
router.put("/users/:user_id/restore", authUsers({ roles: ["superadmin", "owner", "operador"] }), userController.restoreUser);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener usuarios
 *     description: Obtiene la lista de usuarios según el rol del usuario autenticado. Superadmin ve todos los usuarios, Owner/Operador ven solo usuarios de su empresa.
 *     tags:
 *       - Users
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
 *                     format: email
 *                     example: "juan@empresa.com"
 *                   user_role:
 *                     type: string
 *                     enum: [superadmin, owner, operador, profesional]
 *                     example: "profesional"
 *                   user_status:
 *                     type: integer
 *                     enum: [0, 1]
 *                     description: "0 = Bloqueado, 1 = Activo"
 *                     example: 1
 *                   company_id:
 *                     type: integer
 *                     nullable: true
 *                     example: 5
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *                   apto_recibir:
 *                     type: integer
 *                     nullable: true
 *                     enum: [0, 1]
 *                     description: "Solo para profesionales cuando se consulta desde Owner/Operador. 0 = No apto, 1 = Apto"
 *                     example: 1
 *                   especialidades:
 *                     type: array
 *                     nullable: true
 *                     description: "Solo para profesionales cuando se consulta desde Owner/Operador"
 *                     items:
 *                       type: object
 *                       properties:
 *                         Especialidad:
 *                           type: object
 *                           properties:
 *                             nombre_especialidad:
 *                               type: string
 *                               example: "Cardiología"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado)
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users/{company_id}:
 *   get:
 *     summary: Obtener usuarios por empresa
 *     description: Obtiene todos los usuarios de una empresa específica. Solo disponible para superadmin.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *         example: 5
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
 *                   user_complete_name:
 *                     type: string
 *                   user_dni:
 *                     type: string
 *                   user_phone:
 *                     type: string
 *                   user_email:
 *                     type: string
 *                   user_role:
 *                     type: string
 *                   user_status:
 *                     type: integer
 *                   company_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                   updated_at:
 *                     type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo superadmin puede acceder
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario. El dispatcher maneja la lógica según el rol del usuario autenticado.
 *     tags:
 *       - Users
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
 *                 example: "Juan Pérez"
 *               user_dni:
 *                 type: string
 *                 example: "12345678"
 *               user_phone:
 *                 type: string
 *                 example: "+54 9 11 1234-5678"
 *               user_email:
 *                 type: string
 *                 format: email
 *                 example: "juan@empresa.com"
 *               user_password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               user_role:
 *                 type: string
 *                 enum: [superadmin, owner, operador, profesional]
 *                 example: "profesional"
 *               company_id:
 *                 type: integer
 *                 description: "Requerido solo para superadmin cuando crea usuarios no-superadmin"
 *                 example: 5
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
 *         description: Campos requeridos faltantes o datos inválidos
 *       403:
 *         description: Sin permiso para crear este tipo de usuario
 *       409:
 *         description: Email o DNI ya registrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users/{user_id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario existente. El dispatcher maneja la lógica según el rol.
 *     tags:
 *       - Users
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
 *             properties:
 *               user_complete_name:
 *                 type: string
 *               user_dni:
 *                 type: string
 *               user_phone:
 *                 type: string
 *               user_email:
 *                 type: string
 *                 format: email
 *               user_password:
 *                 type: string
 *                 format: password
 *               user_role:
 *                 type: string
 *                 enum: [superadmin, owner, operador, profesional]
 *               user_status:
 *                 type: integer
 *                 enum: [0, 1]
 *               company_id:
 *                 type: integer
 *                 description: "Solo para superadmin"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Usuario no existe o datos inválidos
 *       403:
 *         description: Sin permiso
 *       409:
 *         description: Email o DNI ya registrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users/{user_id}/block:
 *   post:
 *     summary: Bloquear usuario
 *     description: Bloquea un usuario. Disponible para superadmin, owner y operador (operador solo puede bloquear profesionales).
 *     tags:
 *       - Users
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
 *         description: Usuario no existe o ya bloqueado
 *       403:
 *         description: Sin permiso para bloquear este usuario
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users/{user_id}/unblock:
 
 *   post:
 *     summary: Desbloquear usuario
 *     description: Desbloquea un usuario. Disponible para superadmin, owner y operador (operador solo puede desbloquear profesionales).
 *     tags:
 *       - Users
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
 *         description: Sin permiso para desbloquear este usuario
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /users/{user_id}/restore:
 *   put:
 *     summary: Restaurar usuario con nueva contraseña
 *     description: Restaura un usuario bloqueado estableciendo una nueva contraseña. Disponible para superadmin, owner y operador (operador solo puede restaurar profesionales).
 *     tags:
 *       - Users
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
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Usuario restaurado exitosamente
 *       400:
 *         description: Contraseña no provista o usuario ya habilitado
 *       403:
 *         description: Sin permiso para restaurar este usuario
 *       500:
 *         description: Error interno del servidor
 */

