const { saveToken, sendNotificationToUser, deleteToken } = require('../services/NotificationsService');


async function registerToken(req, res) {
    try {
        const userId = req.user.user_id;
        const { expoPushToken, platform } = req.body;

        if (!expoPushToken) {
            return res.status(400).json({ message: 'Falta el token' });
        }

        await saveToken(userId, expoPushToken, platform || 'android');

        return res.json({ message: 'Token registrado correctamente' });
    } catch (err) {
        console.error('Error en NotificationsController:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function sendNotification(req, res) {
    try {
        const { userId, title, body } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const result = await sendNotificationToUser(userId, title, body);

        return res.json({ message: 'Notificación enviada', result });
    } catch (err) {
        console.error('Error enviando notificación:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
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

        return res.json({ message: 'Token eliminado correctamente' });
    } catch (err) {
        console.error('Error en NotificationsController (unregisterToken):', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    registerToken,
    sendNotification,
    auxiliarNotificationMethod,
    unregisterToken
};
