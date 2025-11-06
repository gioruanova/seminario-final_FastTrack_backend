// -----------------
// CONTROLADOR DE NOTIFICACIONES
// -----------------
const UserNotificationSubscription = require('../models/UserNotificationSubscription');
const { enviarExito, enviarError, enviarNoEncontrado } = require("../helpers/responseHelpers");
const webpush = require('web-push');

// -----------------
// CONFIGURAR VAPID
// -----------------
webpush.setVapidDetails(
  'mailto:admin@fasttrack.com',
  process.env.PUSH_KEY_PUBLIC,
  process.env.PUSH_KEY_PRIVATE
);

// -----------------
// OBTENER CLAVE PÚBLICA VAPID
// -----------------
async function getVapidPublicKey(req, res) {
  try {
    res.json({
      publicKey: process.env.PUSH_KEY_PUBLIC
    });
  } catch (error) {
    return enviarError(res, 'Error obteniendo clave pública', 500);
  }
}

// -----------------
// REGISTRAR TOKEN DE NOTIFICACIÓN
// -----------------
async function registerToken(req, res) {
  try {
    const { subscription, platform } = req.body;
    const { user_id } = req.user;

    const existing = await UserNotificationSubscription.query()
      .where('user_id', user_id)
      .where('subscription', JSON.stringify(subscription))
      .first();

    if (existing) {
      return enviarExito(res, 'Token ya registrado');
    }

    await UserNotificationSubscription.query().insert({
      user_id,
      subscription: JSON.stringify(subscription),
      platform: platform || 'web'
    });

    return enviarExito(res, 'Token registrado exitosamente');
  } catch (error) {
    console.error('Error registrando token:', error);
    return enviarError(res, 'Error registrando token', 500);
  }
}

// -----------------
// ENVIAR NOTIFICACIÓN (PARA TESTING)
// -----------------
async function sendNotification(req, res) {
  try {
    const { userId, message, options } = req.body;

    const result = await sendNotificationToUser(userId, message, options);
    res.json(result);
  } catch (error) {
    console.error('Error enviando notificación:', error);
    return enviarError(res, 'Error enviando notificación', 500);
  }
}

// -----------------
// ELIMINAR TODAS LAS SUSCRIPCIONES
// -----------------
async function unregisterToken(req, res) {
  try {
    const { user_id } = req.user;

    await UserNotificationSubscription.query()
      .where('user_id', user_id)
      .delete();

    return enviarExito(res, 'Todas las suscripciones eliminadas');
  } catch (error) {
    console.error('Error eliminando suscripciones:', error);
    return enviarError(res, 'Error eliminando suscripciones', 500);
  }
}

// -----------------
// ELIMINAR SUSCRIPCIÓN ESPECÍFICA
// -----------------
async function unregisterSpecificToken(req, res) {
  try {
    const { user_id } = req.user;
    const { subscription } = req.body;

    const deleted = await UserNotificationSubscription.query()
      .where('user_id', user_id)
      .where('subscription', JSON.stringify(subscription))
      .delete();

    if (deleted === 0) {
      return enviarNoEncontrado(res, 'Suscripción');
    }

    return enviarExito(res, 'Suscripción eliminada');
  } catch (error) {
    console.error('Error eliminando suscripción específica:', error);
    return enviarError(res, 'Error eliminando suscripción', 500);
  }
}

// -----------------
// FUNCIÓN PRINCIPAL PARA ENVIAR NOTIFICACIÓN A USUARIO
// -----------------
async function sendNotificationToUser(userId, titleMessage, message, options = {}, path = null) {
  const title = titleMessage.length >= 30
    ? `${titleMessage.slice(0, 30)}...`
    : titleMessage || 'Fast Track';
  try {
    const notificationData = {
      title: title || 'Fast Track',
      body: message,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'fast-track-notification',
      requireInteraction: true,
      data: options.data || {},
      path: path || null
    };

    const subscriptions = await UserNotificationSubscription.query()
      .where('user_id', userId)
      .where('is_active', true);

    if (subscriptions.length === 0) {
      return { success: false, message: 'Usuario sin subscriptions activas' };
    }

    const results = [];
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          JSON.parse(subscription.subscription),
          JSON.stringify(notificationData)
        );
        results.push({ success: true, subscription: subscription.id });
      } catch (error) {
        console.error('Error enviando a subscription:', error);
        await UserNotificationSubscription.query()
          .findById(subscription.id)
          .patch({ is_active: false });
        results.push({ success: false, error: error.message });
      }
    }

    return {
      success: true,
      message: 'Notificación enviada',
      results: results
    };
  } catch (error) {
    console.error('Error en sendNotificationToUser:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getVapidPublicKey,
  registerToken,
  sendNotification,
  unregisterToken,
  unregisterSpecificToken,
  sendNotificationToUser
};
