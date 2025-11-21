const express = require("express");
const router = express.Router();
const feedbackController = require("../../controllers/FeedbackController");
const authUsers = require("../../middlewares/authUsers");

router.get("/feedback", authUsers({ roles: ["superadmin", "owner", "operador"] }), feedbackController.getFeedbacks);
router.get("/feedback/:feedback_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), feedbackController.getFeedbackById);
router.post("/feedback", authUsers({ roles: ["owner", "operador", "profesional"] }), feedbackController.createFeedback);
router.delete("/feedback/:feedback_id", authUsers({ roles: ["superadmin"] }), feedbackController.deleteFeedback);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Obtener feedbacks
 *     description: Obtiene la lista de feedbacks según el rol del usuario autenticado. Superadmin ve todos los feedbacks, Owner/Operador ven solo feedbacks de su empresa.
 *     tags:
 *       - Feedbacks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de feedbacks obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   feedback_id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 5
 *                   user_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   user_role:
 *                     type: string
 *                     example: "owner"
 *                   user_email:
 *                     type: string
 *                     format: email
 *                     example: "juan@empresa.com"
 *                   company_id:
 *                     type: integer
 *                     example: 3
 *                   company_name:
 *                     type: string
 *                     example: "Mi Empresa S.A."
 *                   feedback_message:
 *                     type: string
 *                     example: "Excelente plataforma, muy fácil de usar"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: El usuario debe estar asociado a una empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El usuario debe estar asociado a una empresa"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado)
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /feedback/{feedback_id}:
 *   get:
 *     summary: Obtener feedback por ID
 *     description: Obtiene un feedback específico por su ID. Superadmin puede ver cualquier feedback, Owner/Operador solo feedbacks de su empresa.
 *     tags:
 *       - Feedbacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del feedback
 *         example: 1
 *     responses:
 *       200:
 *         description: Feedback obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   feedback_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   user_name:
 *                     type: string
 *                   user_role:
 *                     type: string
 *                   user_email:
 *                     type: string
 *                   company_id:
 *                     type: integer
 *                   company_name:
 *                     type: string
 *                   feedback_message:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   updated_at:
 *                     type: string
 *       400:
 *         description: Feedback no encontrado
 *       403:
 *         description: No tienes permiso para ver este feedback
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Crear nuevo feedback
 *     description: Crea un nuevo feedback. Disponible para owner, operador y profesional. El feedback se asocia automáticamente a la empresa del usuario.
 *     tags:
 *       - Feedbacks
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
 *                 description: "* Contenido del mensaje de feedback"
 *                 example: "Excelente plataforma, muy fácil de usar. Me encantaría que agreguen más funcionalidades."
 *     responses:
 *       201:
 *         description: Feedback creado exitosamente
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
 *                   example: "Feedback creado correctamente"
 *       400:
 *         description: Campo requerido faltante o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El campo message_content es obligatorio y no puede estar vacío"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado) o usuario no asociado a empresa
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /feedback/{feedback_id}:
 *   delete:
 *     summary: Eliminar feedback
 *     description: Elimina un feedback del sistema. Solo disponible para superadmin.
 *     tags:
 *       - Feedbacks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del feedback a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Feedback eliminado exitosamente
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
 *                   example: "Feedback eliminado correctamente"
 *       400:
 *         description: Feedback no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Feedback no encontrado"
 *       403:
 *         description: Sin permiso para eliminar este feedback (solo superadmin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tienes permiso para eliminar este feedback"
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno del servidor
 */

