const webpush = require('web-push');
const UserNotificationSubscription = require('../models/UserNotificationSubscription');

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:admin@fasttrack.com', // Cambia por tu email
  process.env.PUSH_KEY_PUBLIC,
  process.env.PUSH_KEY_PRIVATE
);

// GET /customersApi/notifications/vapid-public-key
async function getVapidPublicKey(req, res) {
  try {
    res.json({
      publicKey: process.env.PUSH_KEY_PUBLIC
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo clave pública' });
  }
}

// POST /customersApi/notifications/register-token
async function registerToken(req, res) {
  try {
    const { subscription, platform } = req.body;
    const { user_id } = req.user;

    // Verificar si ya existe
    const existing = await UserNotificationSubscription.query()
      .where('user_id', user_id)
      .where('subscription', JSON.stringify(subscription))
      .first();

    if (existing) {
      return res.json({ success: true, message: 'Token ya registrado' });
    }

    // Crear nueva subscription
    await UserNotificationSubscription.query().insert({
      user_id,
      subscription: JSON.stringify(subscription),
      platform: platform || 'web'
    });

    res.json({ success: true, message: 'Token registrado exitosamente' });
  } catch (error) {
    console.error('Error registrando token:', error);
    res.status(500).json({ error: 'Error registrando token' });
  }
}

// POST /customersApi/notifications/send (para testing)
async function sendNotification(req, res) {
  try {
    const { userId, message, options } = req.body;

    const result = await sendNotificationToUser(userId, message, options);
    res.json(result);
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({ error: 'Error enviando notificación' });
  }
}

// DELETE /customersApi/notifications/unregister-token
async function unregisterToken(req, res) {
  try {
    const { user_id } = req.user;

    // Eliminar todas las suscripciones del usuario
    await UserNotificationSubscription.query()
      .where('user_id', user_id)
      .delete();

    res.json({ success: true, message: 'Todas las suscripciones eliminadas' });
  } catch (error) {
    console.error('Error eliminando suscripciones:', error);
    res.status(500).json({ error: 'Error eliminando suscripciones' });
  }
}

// DELETE /customersApi/notifications/unregister-specific-token
async function unregisterSpecificToken(req, res) {
  try {
    const { user_id } = req.user;
    const { subscription } = req.body;

    // Eliminar suscripción específica
    const deleted = await UserNotificationSubscription.query()
      .where('user_id', user_id)
      .where('subscription', JSON.stringify(subscription))
      .delete();

    if (deleted === 0) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }

    res.json({ success: true, message: 'Suscripción eliminada' });
  } catch (error) {
    console.error('Error eliminando suscripción específica:', error);
    res.status(500).json({ error: 'Error eliminando suscripción' });
  }
}

// FUNCIÓN PRINCIPAL QUE USARÁS
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

    // Obtener subscriptions del usuario
    const subscriptions = await UserNotificationSubscription.query()
      .where('user_id', userId)
      .where('is_active', true);

    if (subscriptions.length === 0) {
      return { success: false, message: 'Usuario sin subscriptions activas' };
    }

    // Enviar a todas las subscriptions
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
        // Marcar subscription como inactiva si falla
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
