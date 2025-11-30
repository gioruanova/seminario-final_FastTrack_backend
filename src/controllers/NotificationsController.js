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
    console.log("[registerToken] Request recibido:", {
      method: req.method,
      path: req.path,
      hasUser: !!req.user,
      userId: req.user?.user_id,
      userRole: req.user?.user_role,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      expoPushToken: req.body?.expoPushToken ? req.body.expoPushToken.substring(0, 30) + "..." : null,
      platform: req.body?.platform,
      cookies: req.cookies ? Object.keys(req.cookies) : [],
      headers: {
        'content-type': req.headers['content-type'],
        'origin': req.headers.origin,
        'user-agent': req.headers['user-agent']?.substring(0, 50),
      }
    });

    const userId = req.user.user_id;
    const { expoPushToken, platform } = req.body;

    if (!expoPushToken) {
      console.error("[registerToken] Error: expoPushToken no proporcionado");
      throw new Error("Falta el token");
    }

    console.log("[registerToken] Guardando token para userId:", userId);
    await saveToken(userId, expoPushToken, platform || 'android');
    console.log("[registerToken] Token guardado exitosamente");

    return enviarExito(res, "Token registrado correctamente", 201);
  } catch (error) {
    console.error("[registerToken] Error capturado:", {
      message: error.message,
      stack: error.stack?.substring(0, 200),
    });
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
