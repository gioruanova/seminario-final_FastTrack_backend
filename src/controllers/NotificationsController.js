const { saveToken, sendNotificationToUser, deleteToken } = require('../services/notifications/NotificationsService');
const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida } = require('../helpers/responseHelpers');

function manejarError(error, res) {
  const mensajesConocidos = {
    "Usuario no tiene token registrado": () => enviarSolicitudInvalida(res, error.message),
    "Falta el token": () => enviarSolicitudInvalida(res, error.message),
    "Faltan datos": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  console.error("Error en NotificationsController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function registerToken(req, res) {
  try {
    const userId = req.user.user_id;
    const { expoPushToken, platform } = req.body;

    if (!expoPushToken) {
      throw new Error("Falta el token");
    }

    await saveToken(userId, expoPushToken, platform || 'android');

    return enviarExito(res, "Token registrado correctamente", 201);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function sendNotification(req, res) {
  try {
    const { userId, title, body } = req.body;

    const result = await sendNotificationToUser(userId, title, body);

    return enviarLista(res, {
      success: true,
      message: "Notificación enviada",
      result
    });
  } catch (error) {
    return manejarError(error, res);
  }
}

async function auxiliarNotificationMethod(userId, title, body) {
  const result = await sendNotificationToUser(userId, title, body);
  return result;
}

async function unregisterToken(req, res) {
  try {
    const userId = req.user.user_id;
    const { expoPushToken } = req.body;

    await deleteToken(userId, expoPushToken || null);

    return enviarExito(res, "Token eliminado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { registerToken, sendNotification, auxiliarNotificationMethod, unregisterToken };
