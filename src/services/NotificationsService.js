const UserPushToken = require("../models/UserPushToken");
const fetch = require("node-fetch");

async function saveToken(userId, expoPushToken, platform = "android") {
    const existing = await UserPushToken.query()
        .where({ user_id: userId, expo_push_token: expoPushToken })
        .first();

    if (existing) {
        await UserPushToken.query()
            .findById(existing.id)
            .patch({ updated_at: new Date().toISOString(), platform });
    } else {
        await UserPushToken.query().insert({
            user_id: userId,
            expo_push_token: expoPushToken,
            platform,
        });
    }

    console.log(`Token registrado/actualizado para user_id=${userId}`);
    return true;
}

async function getToken(userId) {
    const tokenRow = await UserPushToken.query()
        .where({ user_id: userId })
        .orderBy("updated_at", "desc")
        .first();

    return tokenRow ? tokenRow.expo_push_token : null;
}

async function getAllTokens() {
    const tokens = await UserPushToken.query().select("expo_push_token");
    return tokens.map((t) => t.expo_push_token);
}

async function sendNotificationToUser(userId, title, body) {
    const expoPushToken = await getToken(userId);

    if (!expoPushToken) {
        throw new Error("Usuario no tiene token registrado");
    }

    const message = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: { extraData: "Información adicional opcional" },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("Respuesta Expo API:", data);

    return data;
}

module.exports = {
    saveToken,
    getToken,
    getAllTokens,
    sendNotificationToUser,
};
