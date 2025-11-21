const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/ProfileController");
const authUsers = require("../../middlewares/authUsers");

router.get("/profile", authUsers({ roles: ["superadmin", "owner", "operador", "profesional"] }), profileController.getProfile);
router.put("/profile", authUsers({ roles: ["owner", "operador", "profesional"] }), profileController.updateProfile);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Obtener perfil propio
 *     description: Obtiene la información del perfil del usuario autenticado. Superadmin ve solo datos básicos, otros roles ven también información de la empresa.
 *     tags:
 *       - User Profile
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
 *                 user_email:
 *                   type: string
 *                   format: email
 *                   example: "usuario@empresa.com"
 *                 user_name:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 user_role:
 *                   type: string
 *                   enum: [superadmin, owner, operador, profesional]
 *                   example: "owner"
 *                 company_id:
 *                   type: integer
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin"
 *                   example: 5
 *                 company_name:
 *                   type: string
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin"
 *                   example: "Mi Empresa S.A."
 *                 company_status:
 *                   type: integer
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin. 0 = Inactiva, 1 = Activa"
 *                   enum: [0, 1]
 *                   example: 1
 *                 user_phone:
 *                   type: string
 *                   nullable: true
 *                   example: "+54 9 11 1234-5678"
 *                 company_phone:
 *                   type: string
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin"
 *                   example: "+54 9 11 9876-5432"
 *                 company_email:
 *                   type: string
 *                   format: email
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin"
 *                   example: "contacto@empresa.com"
 *                 company_whatsapp:
 *                   type: string
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin"
 *                   example: "+54 9 11 1234-5678"
 *                 company_telegram:
 *                   type: string
 *                   nullable: true
 *                   description: "Solo para roles que no sean superadmin"
 *                   example: "@empresa"
 *                 user_dni:
 *                   type: string
 *                   nullable: true
 *                   example: "12345678"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token no provisto"
 *       403:
 *         description: Sin permiso (rol no autorizado o usuario bloqueado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
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
 * /profile:
 *   put:
 *     summary: Actualizar perfil propio
 *     description: Actualiza la información del perfil del usuario autenticado. Solo se pueden actualizar campos permitidos y se valida que no haya duplicados de email o DNI.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 example: "nuevoemail@empresa.com"
 *               user_password:
 *                 type: string
 *                 format: password
 *                 description: "Nueva contraseña. Solo se actualiza si es diferente a la actual"
 *                 example: "nuevaPassword123"
 *               user_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: "0 = Bloqueado, 1 = Activo"
 *                 example: 1
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
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
 *         description: Solicitud inválida (campos vacíos, no se proporcionaron campos, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El campo user_email no puede estar vacío"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token no provisto"
 *       403:
 *         description: Sin permiso (rol no autorizado o usuario bloqueado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       409:
 *         description: Conflicto (email o DNI ya registrado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El email ya está registrado"
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

