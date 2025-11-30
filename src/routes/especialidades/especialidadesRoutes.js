const express = require("express");
const router = express.Router();
const especialidadController = require("../../controllers/EspecialidadController");
const authUsers = require("../../middlewares/authUsers");

router.get("/especialidades", authUsers({ roles: ["superadmin", "owner", "operador"] }), especialidadController.getEspecialidades);
router.get("/especialidades/:company_id", authUsers({ roles: ["superadmin"] }), especialidadController.getEspecialidadesByCompany);
router.post("/especialidades", authUsers({ roles: ["superadmin", "owner", "operador"] }), especialidadController.createEspecialidad);
router.put("/especialidades/:especialidad_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), especialidadController.updateEspecialidad);
router.put("/especialidades/:especialidad_id/block", authUsers({ roles: ["superadmin", "owner", "operador"] }), especialidadController.blockEspecialidad);
router.put("/especialidades/:especialidad_id/unblock", authUsers({ roles: ["superadmin", "owner", "operador"] }), especialidadController.unblockEspecialidad);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /especialidades:
 *   get:
 *     summary: Obtener especialidades
 *     description: Obtiene la lista de especialidades según el rol del usuario autenticado. Superadmin ve todas las especialidades, Owner/Operador ven solo las de su empresa.
 *     tags:
 *       - Especialidades
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
 *                     example: "Cardiología"
 *                   company_id:
 *                     type: integer
 *                     example: 5
 *                   estado_especialidad:
 *                     type: integer
 *                     enum: [0, 1]
 *                     description: "0 = Desactivada, 1 = Activada"
 *                     example: 1
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado)
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /especialidades/{company_id}:
 *   get:
 *     summary: Obtener especialidades por empresa
 *     description: Obtiene todas las especialidades de una empresa específica. Solo disponible para superadmin.
 *     tags:
 *       - Especialidades
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
 *         description: Lista de especialidades de la empresa obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo superadmin puede acceder
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /especialidades:
 *   post:
 *     summary: Crear nueva especialidad
 *     description: Crea una nueva especialidad. El dispatcher maneja la lógica según el rol del usuario autenticado. Superadmin puede crear para cualquier empresa, Owner/Operador solo para su empresa.
 *     tags:
 *       - Especialidades
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
 *                 example: "Cardiología"
 *               company_id:
 *                 type: integer
 *                 description: "Requerido solo para superadmin"
 *                 example: 5
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
 *         description: Campos requeridos faltantes, límite alcanzado o datos inválidos
 *       409:
 *         description: La especialidad ya existe para esta empresa
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /especialidades/{especialidad_id}:
 *   put:
 *     summary: Actualizar especialidad
 *     description: Actualiza el nombre de una especialidad existente. El dispatcher maneja la lógica según el rol. Superadmin puede editar cualquier especialidad, Owner/Operador solo las de su empresa.
 *     tags:
 *       - Especialidades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidad_id
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
 *                 example: "Cardiología Avanzada"
 *     responses:
 *       200:
 *         description: Especialidad actualizada exitosamente
 *       400:
 *         description: Especialidad no existe o datos inválidos
 *       403:
 *         description: Sin permiso
 *       409:
 *         description: Ya existe una especialidad con ese nombre
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /especialidades/{especialidad_id}/block:
 *   put:
 *     summary: Desactivar especialidad
 *     description: Desactiva una especialidad. El dispatcher maneja la lógica según el rol. Superadmin puede desactivar cualquier especialidad, Owner/Operador solo las de su empresa.
 *     tags:
 *       - Especialidades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidad_id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Especialidad no existe o ya desactivada
 *       403:
 *         description: Sin permiso para desactivar esta especialidad
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /especialidades/{especialidad_id}/unblock:
 *   put:
 *     summary: Activar especialidad
 *     description: Activa una especialidad desactivada. El dispatcher maneja la lógica según el rol. Superadmin puede activar cualquier especialidad, Owner/Operador solo las de su empresa.
 *     tags:
 *       - Especialidades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidad_id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Especialidad no existe o ya activada
 *       403:
 *         description: Sin permiso para activar esta especialidad
 *       500:
 *         description: Error interno del servidor
 */

