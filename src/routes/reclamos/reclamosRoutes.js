const express = require("express");
const router = express.Router();
const reclamoController = require("../../controllers/ReclamoController");
const exportReclamosController = require("../../controllers/ExportReclamosController");
const authUsers = require("../../middlewares/authUsers");

router.get("/reclamos", authUsers({ roles: ["superadmin", "owner", "operador", "profesional"] }), reclamoController.getReclamos);
router.get("/reclamos/:reclamo_id", authUsers({ roles: ["owner", "operador", "profesional"] }), reclamoController.getReclamoById);
router.post("/reclamos", authUsers({ roles: ["owner", "operador"] }), reclamoController.createReclamo);
router.put("/reclamos/:reclamo_id", authUsers({ roles: ["owner", "operador", "profesional"] }), reclamoController.updateReclamo);
router.put("/reclamos/:reclamo_id/recordatorio", authUsers({ roles: ["owner", "operador"] }), reclamoController.recordatorioReclamo);
router.get("/reclamos/export/:status", authUsers({ roles: ["owner", "operador"] }), exportReclamosController.exportReclamosToExcel);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * tags:
 *   name: Reclamos
 *   description: Gestión de reclamos (dispatcher según rol)
 */

/**
 * @swagger
 * /reclamos:
 *   get:
 *     summary: Obtener reclamos (dispatcher según rol)
 *     description: |
 *       Obtiene reclamos según el rol del usuario autenticado:
 *       - **Superadmin**: Todos los reclamos (opcionalmente filtrado por `company_id` query param)
 *       - **Owner/Operador**: Reclamos de su empresa
 *       - **Profesional**: Solo sus propios reclamos
 *     tags:
 *       - Reclamos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: ID de la empresa (solo para superadmin, opcional)
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de reclamos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Reclamo'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /reclamos:
 *   post:
 *     summary: Crear nuevo reclamo (solo owner/operador)
 *     description: Crea un nuevo reclamo con agenda. Solo disponible para owner y operador.
 *     tags:
 *       - Reclamos
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
 *               - especialidad_id
 *               - profesional_id
 *               - cliente_id
 *               - agenda_fecha
 *               - agenda_hora_desde
 *             properties:
 *               reclamo_titulo:
 *                 type: string
 *                 example: "Problema con instalación eléctrica"
 *               reclamo_detalle:
 *                 type: string
 *                 example: "El cliente reporta problemas con la instalación eléctrica en su domicilio"
 *               reclamo_url:
 *                 type: string
 *                 nullable: true
 *                 description: Requerido si la empresa lo requiere en su configuración
 *                 example: "https://ejemplo.com/documento.pdf"
 *               especialidad_id:
 *                 type: integer
 *                 example: 5
 *               profesional_id:
 *                 type: integer
 *                 example: 123
 *               cliente_id:
 *                 type: integer
 *                 example: 456
 *               agenda_fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-30"
 *               agenda_hora_desde:
 *                 type: string
 *                 pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                 example: "09:00"
 *               agenda_hora_hasta:
 *                 type: string
 *                 pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                 nullable: true
 *                 description: Si no se proporciona, se establece automáticamente a 23:59:59
 *                 example: "10:00"
 *               reclamo_presupuesto:
 *                 type: number
 *                 nullable: true
 *                 example: 15000.50
 *     responses:
 *       201:
 *         description: Reclamo creado exitosamente
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
 *                   example: "Reclamo creado exitosamente"
 *       400:
 *         description: Datos inválidos o faltantes
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /reclamos/{reclamo_id}:
 *   get:
 *     summary: Obtener reclamo por ID (dispatcher según rol)
 *     description: |
 *       Obtiene un reclamo específico según el rol:
 *       - **Owner/Operador**: Cualquier reclamo de su empresa
 *       - **Profesional**: Solo sus propios reclamos
 *     tags:
 *       - Reclamos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclamo
 *         example: 10001
 *     responses:
 *       200:
 *         description: Reclamo obtenido exitosamente
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
 *                     $ref: '#/components/schemas/Reclamo'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no autorizado o reclamo no pertenece al usuario
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /reclamos/{reclamo_id}:
 *   put:
 *     summary: Actualizar reclamo (dispatcher según rol)
 *     description: |
 *       Actualiza un reclamo según el rol:
 *       - **Owner/Operador**: Pueden actualizar cualquier reclamo de su empresa
 *       - **Profesional**: Solo puede actualizar sus propios reclamos y agregar notas
 *     tags:
 *       - Reclamos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclamo
 *         example: 10001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reclamo_titulo:
 *                 type: string
 *                 example: "Problema con instalación eléctrica - Actualizado"
 *               reclamo_detalle:
 *                 type: string
 *                 example: "Detalle actualizado del problema"
 *               reclamo_url:
 *                 type: string
 *                 nullable: true
 *                 example: "https://ejemplo.com/documento-actualizado.pdf"
 *               reclamo_estado:
 *                 type: string
 *                 enum: [ABIERTO, EN PROCESO, EN PAUSA, CERRADO, CANCELADO, RE-ABIERTO]
 *                 example: "EN PROCESO"
 *               especialidad_id:
 *                 type: integer
 *                 example: 5
 *               profesional_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 123
 *               cliente_id:
 *                 type: integer
 *                 example: 456
 *               agenda_fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-30"
 *               agenda_hora_desde:
 *                 type: string
 *                 pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                 example: "09:00"
 *               agenda_hora_hasta:
 *                 type: string
 *                 pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$"
 *                 nullable: true
 *                 example: "10:00"
 *               reclamo_nota_cierre:
 *                 type: string
 *                 nullable: true
 *                 description: Requerido al cerrar un reclamo
 *                 example: "Problema resuelto satisfactoriamente"
 *               reclamo_presupuesto:
 *                 type: number
 *                 nullable: true
 *                 example: 15000.50
 *     responses:
 *       200:
 *         description: Reclamo actualizado exitosamente
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
 *                   example: "Reclamo actualizado correctamente"
 *       400:
 *         description: Datos inválidos o reclamo ya cerrado
 *       403:
 *         description: Rol no autorizado o reclamo no pertenece al usuario
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /reclamos/{reclamo_id}/recordatorio:
 *   put:
 *     summary: Enviar recordatorio de reclamo (solo owner/operador)
 *     description: Envía un recordatorio de un reclamo al profesional asignado. Solo disponible para owner y operador.
 *     tags:
 *       - Reclamos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reclamo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reclamo
 *         example: 10001
 *     responses:
 *       200:
 *         description: Recordatorio enviado exitosamente
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
 *                   example: "Recordatorio de incidencia enviado correctamente"
 *       400:
 *         description: Reclamo no puede ser recordatorio o datos inválidos
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Reclamo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /reclamos/export/{status}:
 *   get:
 *     summary: Exportar reclamos a Excel (solo owner/operador)
 *     description: Exporta los reclamos de la empresa a un archivo Excel filtrados por estado. Solo disponible para owner y operador.
 *     tags:
 *       - Reclamos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Estado de los reclamos a exportar (puede ser "all" para todos)
 *         example: "ABIERTO"
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Estado inválido
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Reclamo:
 *       type: object
 *       properties:
 *         reclamo_id:
 *           type: integer
 *           example: 10001
 *         reclamo_titulo:
 *           type: string
 *           example: "Problema con instalación eléctrica"
 *         reclamo_detalle:
 *           type: string
 *           example: "El cliente reporta problemas con la instalación eléctrica"
 *         reclamo_url:
 *           type: string
 *           nullable: true
 *           example: "https://ejemplo.com/documento.pdf"
 *         reclamo_estado:
 *           type: string
 *           enum: [ABIERTO, EN PROCESO, EN PAUSA, CERRADO, CANCELADO, RE-ABIERTO]
 *           example: "ABIERTO"
 *         creado_por:
 *           type: integer
 *           nullable: true
 *           example: 10
 *         company_id:
 *           type: integer
 *           example: 5
 *         especialidad_id:
 *           type: integer
 *           example: 5
 *         profesional_id:
 *           type: integer
 *           nullable: true
 *           example: 123
 *         cliente_id:
 *           type: integer
 *           example: 456
 *         reclamo_nota_cierre:
 *           type: string
 *           nullable: true
 *           example: "Problema resuelto satisfactoriamente"
 *         reclamo_presupuesto:
 *           type: number
 *           nullable: true
 *           example: 15000.50
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00Z"
 *         agenda_fecha:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2025-01-30"
 *         agenda_hora_desde:
 *           type: string
 *           nullable: true
 *           example: "09:00"
 *         agenda_hora_hasta:
 *           type: string
 *           nullable: true
 *           example: "10:00"
 */

