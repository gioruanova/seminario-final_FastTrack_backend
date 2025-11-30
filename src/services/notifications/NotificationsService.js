const UserPushToken = require("../../models/UserPushToken");
const fetch = require("node-fetch");

async function saveToken(userId, expoPushToken, platform = "android") {
    console.log("[saveToken] Iniciando guardado:", {
        userId,
        expoPushToken: expoPushToken ? expoPushToken.substring(0, 30) + "..." : null,
        platform,
    });

    if (!expoPushToken) {
        console.error("[saveToken] Error: expoPushToken es null o undefined");
        throw new Error("Falta el token");
    }

    const existing = await UserPushToken.query()
        .where({ user_id: userId, expo_push_token: expoPushToken })
        .first();

    if (existing) {
        console.log("[saveToken] Token existente encontrado, actualizando. ID:", existing.id);
        await UserPushToken.query()
            .findById(existing.id)
            .patch({ updated_at: new Date().toISOString(), platform });
        console.log("[saveToken] Token actualizado exitosamente");
    } else {
        console.log("[saveToken] Token nuevo, insertando en BD");
        const inserted = await UserPushToken.query().insert({
            user_id: userId,
            expo_push_token: expoPushToken,
            platform,
        });
        console.log("[saveToken] Token insertado exitosamente. ID:", inserted.id);
    }

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

async function deleteToken(userId, expoPushToken = null) {
    if (expoPushToken) {
        await UserPushToken.query()
            .where({ user_id: userId, expo_push_token: expoPushToken })
            .delete();
    } else {
        await UserPushToken.query()
            .where({ user_id: userId })
            .delete();
    }
    return true;
}

async function sendNotificationToUser(userId, title, body) {
    if (!userId || !title || !body) {
        throw new Error("Faltan datos");
    }

    const expoPushToken = await getToken(userId);

    if (!expoPushToken) {
        return null;
    }

    const message = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: { extraData: "Información adicional opcional" },
        priority: "high"
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

    return data;
}

module.exports = { saveToken, getToken, getAllTokens, sendNotificationToUser, deleteToken };
