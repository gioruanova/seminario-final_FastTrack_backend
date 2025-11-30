const express = require("express");
const router = express.Router();
const agendaReclamoController = require("../../controllers/AgendaReclamoController");
const authUsers = require("../../middlewares/authUsers");

router.get("/agenda-reclamo", authUsers({ roles: ["owner", "operador"] }), agendaReclamoController.getAgendaReclamo);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /agenda-reclamo:
 *   get:
 *     summary: Obtener agenda de reclamos
 *     description: Obtiene la agenda de reclamos de la empresa del usuario autenticado. Incluye información del profesional, especialidad, fecha y horarios de los reclamos agendados.
 *     tags:
 *       - Agenda de Reclamos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agenda de reclamos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       profesional_id:
 *                         type: integer
 *                         example: 123
 *                       especialidad_id:
 *                         type: integer
 *                         example: 5
 *                       agenda_fecha:
 *                         type: string
 *                         format: date
 *                         example: "2025-01-25"
 *                       agenda_hora_desde:
 *                         type: string
 *                         pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                         example: "09:00"
 *                       agenda_hora_hasta:
 *                         type: string
 *                         pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                         example: "10:00"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado)
 *       500:
 *         description: Error interno del servidor
 */

