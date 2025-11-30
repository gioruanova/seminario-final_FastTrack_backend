const express = require("express");
const router = express.Router();
const disponibilidadController = require("../../controllers/DisponibilidadController");
const authUsers = require("../../middlewares/authUsers");

router.get("/disponibilidad/:user_id", authUsers({ roles: ["owner", "operador"] }), disponibilidadController.getDisponibilidadBloqueadaByProfesioanlAsAdmin);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /disponibilidad/{user_id}:
 *   get:
 *     summary: Obtener disponibilidad bloqueada de un profesional
 *     description: Obtiene la disponibilidad bloqueada de un profesional específico. Retorna los bloqueos existentes en la agenda de reclamos para ese profesional dentro de la empresa del usuario autenticado.
 *     tags:
 *       - Disponibilidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesional
 *         example: 123
 *     responses:
 *       200:
 *         description: Disponibilidad bloqueada obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     bloqueos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           origen:
 *                             type: string
 *                             example: "reclamo"
 *                           fecha:
 *                             type: string
 *                             format: date
 *                             example: "2025-01-25"
 *                           desde:
 *                             type: string
 *                             pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                             example: "09:00"
 *                           hasta:
 *                             type: string
 *                             pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                             example: "10:00"
 *                 message:
 *                   type: string
 *                   example: ""
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado)
 *       500:
 *         description: Error interno del servidor
 */

