const express = require("express");
const router = express.Router();
const profesionalEspecialidadController = require("../../controllers/ProfesionalEspecialidadController");
const authUsers = require("../../middlewares/authUsers");

router.get("/profesional-especialidad", authUsers({ roles: ["owner", "operador"] }), profesionalEspecialidadController.getAsignaciones);
router.post("/profesional-especialidad", authUsers({ roles: ["superadmin", "owner", "operador"] }), profesionalEspecialidadController.assignEspecialidad);
router.delete("/profesional-especialidad/:asignacion_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), profesionalEspecialidadController.deleteAsignacion);
router.put("/profesional-especialidad/:asignacion_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), profesionalEspecialidadController.updateAsignacion);

module.exports = router;

/**
 * @swagger
 * /profesional-especialidad:
 *   get:
 *     summary: Obtener asignaciones profesional-especialidad
 *     description: Obtiene la lista de asignaciones entre profesionales y especialidades de la empresa del usuario autenticado. Solo disponible para Owner/Operador.
 *     tags:
 *       - Profesional-Especialidad
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
 *                     example: 5
 *                   profesional_nombre:
 *                     type: string
 *                     example: "Dr. Juan Pérez"
 *                   especialidad_id:
 *                     type: integer
 *                     example: 1
 *                   especialidad_nombre:
 *                     type: string
 *                     example: "Cardiología"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (solo Owner/Operador pueden acceder)
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /profesional-especialidad:
 *   post:
 *     summary: Asignar especialidad a profesional
 *     description: Asigna una especialidad a un profesional. El dispatcher maneja la lógica según el rol del usuario autenticado. Superadmin puede asignar para cualquier empresa, Owner/Operador solo para su empresa.
 *     tags:
 *       - Profesional-Especialidad
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
 *                 description: ID del profesional al que se le asignará la especialidad
 *                 example: 5
 *               especialidad_id:
 *                 type: integer
 *                 description: ID de la especialidad a asignar
 *                 example: 1
 *     responses:
 *       201:
 *         description: Especialidad asignada exitosamente
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
 *                   example: "Especialidad asignada correctamente"
 *       400:
 *         description: Campos requeridos faltantes, especialidad inactiva o datos inválidos
 *       404:
 *         description: Profesional o especialidad no encontrados
 *       409:
 *         description: La especialidad ya está asignada al profesional
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /profesional-especialidad/{asignacion_id}:
 *   delete:
 *     summary: Eliminar asignación profesional-especialidad
 *     description: Elimina una asignación entre un profesional y una especialidad. El dispatcher maneja la lógica según el rol. Superadmin puede eliminar cualquier asignación, Owner/Operador solo las de su empresa.
 *     tags:
 *       - Profesional-Especialidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asignacion_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación a eliminar
 *         example: 10
 *     responses:
 *       201:
 *         description: Asignación eliminada exitosamente
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
 *                   example: "Asignacion eliminada correctamente"
 *       400:
 *         description: ID de asignación requerido
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /profesional-especialidad/{asignacion_id}:
 *   put:
 *     summary: Actualizar asignación profesional-especialidad
 *     description: Actualiza una asignación existente cambiando la especialidad asignada a un profesional. El dispatcher maneja la lógica según el rol. Superadmin puede actualizar cualquier asignación, Owner/Operador solo las de su empresa.
 *     tags:
 *       - Profesional-Especialidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asignacion_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación a actualizar
 *         example: 10
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
 *                 description: ID de la nueva especialidad a asignar
 *                 example: 2
 *     responses:
 *       201:
 *         description: Asignación actualizada exitosamente
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
 *                   example: "Asignacion editada correctamente"
 *       400:
 *         description: Campos requeridos faltantes, especialidad inactiva o datos inválidos
 *       404:
 *         description: Asignación o especialidad no encontradas
 *       409:
 *         description: La especialidad ya está asignada al profesional
 *       500:
 *         description: Error interno del servidor
 */