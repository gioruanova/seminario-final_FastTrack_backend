const express = require("express");
const router = express.Router();
const notificationsController = require("../../controllers/NotificationsController");
const authUsers = require("../../middlewares/authUsers");

// Endpoint de prueba para verificar logs (sin autenticación)
router.get("/notifications/test-logs", (req, res) => {
  console.log("========================================");
  console.log("[TEST-LOGS] Endpoint de prueba llamado");
  console.log("[TEST-LOGS] Timestamp:", new Date().toISOString());
  console.log("[TEST-LOGS] Request method:", req.method);
  console.log("[TEST-LOGS] Request path:", req.path);
  console.log("[TEST-LOGS] Request headers:", JSON.stringify(req.headers, null, 2));
  console.log("========================================");
  
  res.status(200).json({
    success: true,
    message: "Logs de prueba enviados. Revisa Railway logs.",
    timestamp: new Date().toISOString()
  });
});

router.post("/notifications", authUsers({ roles: ["profesional"] }), notificationsController.registerToken);
router.delete("/notifications", authUsers({ roles: ["profesional"] }), notificationsController.unregisterToken);
router.post("/send-notifications", authUsers({ roles: ["profesional"] }), notificationsController.sendNotification);

module.exports = router;

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Registrar token de notificaciones push
 *     description: Registra un token de Expo Push Notifications para un profesional. Si el token ya existe, se actualiza la fecha de modificación.
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expoPushToken
 *             properties:
 *               expoPushToken:
 *                 type: string
 *                 description: Token de Expo Push Notifications
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *               platform:
 *                 type: string
 *                 enum: [android, ios]
 *                 default: android
 *                 description: Plataforma del dispositivo
 *                 example: "android"
 *     responses:
 *       201:
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
 *         description: Token faltante o datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo profesionales pueden registrar tokens
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Eliminar token de notificaciones push
 *     description: Elimina un token de notificaciones push específico o todos los tokens de un profesional. Si no se proporciona expoPushToken, se eliminan todos los tokens del usuario.
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expoPushToken:
 *                 type: string
 *                 description: Token específico a eliminar. Si no se proporciona, se eliminan todos los tokens del usuario.
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Token eliminado exitosamente
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
 *                   example: "Token eliminado correctamente"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo profesionales pueden eliminar tokens
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /send-notifications:
 *   post:
 *     summary: Enviar notificación push
 *     description: Envía una notificación push a un usuario específico usando su token registrado. Solo disponible para profesionales.
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID del usuario destinatario
 *                 example: 5
 *               title:
 *                 type: string
 *                 description: Título de la notificación
 *                 example: "Nueva Incidencia Asignada"
 *               body:
 *                 type: string
 *                 description: Cuerpo del mensaje de la notificación
 *                 example: "Tienes una nueva incidencia asignada"
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
 *                   example: "Notificación enviada"
 *                 result:
 *                   type: object
 *                   description: Resultado de la API de Expo Push Notifications
 *       400:
 *         description: Datos faltantes o usuario sin token registrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo profesionales pueden enviar notificaciones
 *       500:
 *         description: Error interno del servidor
 */

