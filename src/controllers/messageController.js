const knex = require("../db/knex");

const PlatformMessage = require("../models/PlatformMessage");
const PlatformMessageUser = require("../models/PlatformMessageUser");
const User = require("../models/User");

const { registrarNuevoLog } = require("../controllers/globalLogController");

const { sendNotificationToUser } = require("./notificationController");

const sistemaSender = "Fast Track Updates";

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Enviar mensaje para todos los usuarios
// ---------------------------------------------------------
async function createMessageForAllAsAdmin(req, res) {
  const { platform_message_title, platform_message_content } = req.body;
  const message_sender = sistemaSender;

  try {
    const message = await PlatformMessage.query().insert({
      platform_message_title,
      platform_message_content,
      message_sender,
      apto_empresa: true,
      user_id: null,
      company_id: null,
    });

    const users = await User.query().select("user_id");

    const entries = users.map((user) => ({
      platform_message_id: message.platform_message_id,
      user_id: user.user_id,
      is_read: false,
    }));

    await knex.batchInsert("platform_messages_users", entries);

    res
      .status(201)
      .json({ message: "Mensaje creado para todos los usuarios." });
  } catch (error) {
    res.status(500).json({ error: "Error creando mensaje para todos." });
  }
}
// ---------------------------------------------------------
// Enviar mensaje para toda la empresa
// ---------------------------------------------------------
async function createMessageForCompanyAsAdmin(req, res) {
  const { platform_message_title, platform_message_content } = req.body;
  const { company_id } = req.params;
  const message_sender = sistemaSender;

  try {
    const message = await PlatformMessage.query().insert({
      platform_message_title,
      platform_message_content,
      message_sender,
      apto_empresa: false,
      user_id: null,
      company_id,
    });

    const users = await User.query()
      .select("user_id")
      .where("company_id", company_id)
      .andWhere("user_role", "owner");

    const entries = users.map((user) => ({
      platform_message_id: message.platform_message_id,
      user_id: user.user_id,
      is_read: false,
    }));

    await knex.batchInsert("platform_messages_users", entries);


    res.status(201).json({ message: "Mensaje creado unicamente para owners." });
  } catch (error) {

    res.status(500).json({ error: "Error creando mensaje para todos." });
  }
}

// ---------------------------------------------------------
// Enviar mensaje para usuario puntual
// ---------------------------------------------------------
async function createMessageForUserAsAdmin(req, res) {
  const { platform_message_title, platform_message_content } = req.body;
  const { user_id } = req.params;
  const message_sender = sistemaSender;

  try {
    const user = await User.query().findById(user_id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const message = await PlatformMessage.query().insert({
      platform_message_title,
      platform_message_content,
      message_sender,
      apto_empresa: false,
      user_id: user.user_id,
      company_id: user.company_id,
    });

    await knex("platform_messages_users").insert({
      platform_message_id: message.platform_message_id,
      user_id: user.user_id,
      is_read: false,
    });

    sendNotificationToUser(user.user_id, "Nuevo mensaje", platform_message_title, { title: "Fast Track" }, `/dashboard/${user.user_role}/mensajes`);

    res.status(201).json({ message: "Mensaje creado para el usuario." });
  } catch (error) {

    res.status(500).json({ error: "Error creando mensaje para el usuario." });
  }
}

// ---------------------------------------------------------
// Borrar masivamente mensajes generales
// ---------------------------------------------------------
async function deleteMessageAsAdmin(req, res) {
  const { platform_message_id } = req.params;

  try {
    const validateMessage = await PlatformMessage.query().findById(
      platform_message_id
    );

    if (!validateMessage) {
      return res
        .status(404)
        .json({ error: "Mensaje no se pudo encontrar o ya estaba borrado." });
    }

    await PlatformMessage.query().deleteById(platform_message_id);

    res.status(200).json({ message: "Mensaje eliminado." });
  } catch (error) {

    res.status(500).json({ error: "Error al eliminar mensaje." });
  }
}

// CONTROLADORES PARA CLIENT:
// ---------------------------------------------------------
// Enviar mensaje para todos los usuarios
// ---------------------------------------------------------
async function createMessageForCompanyAsClient(req, res) {
  const { platform_message_title, platform_message_content } = req.body;
  const company_id = req.user.company_id;
  const message_sender = req.user.company_name;

  try {
    const message = await PlatformMessage.query().insert({
      platform_message_title,
      platform_message_content,
      message_sender,
      apto_empresa: true,
      user_id: null,
      company_id,
    });

    const users = await User.query()
      .select("user_id")
      .where("company_id", company_id);

    const entries = users.map((user) => ({
      platform_message_id: message.platform_message_id,
      user_id: user.user_id,
      is_read: false,
    }));

    await knex.batchInsert("platform_messages_users", entries);

    /*LOGGER*/ await registrarNuevoLog(
      req.user.company_id,
      "Se envio un mensaje a todos los usuarios de la empresa con el titulo " +
      platform_message_title +
      "."
    );

    res
      .status(201)
      .json({ message: "Mensaje creado para todos los usuarios." });
  } catch (error) {

    res.status(500).json({ error: "Error creando mensaje para todos." });
  }
}

// ---------------------------------------------------------
// Enviar mensaje para usuario puntual
// ---------------------------------------------------------
async function createMessageForUserAsClient(req, res) {
  const { platform_message_title, platform_message_content } = req.body;
  const { user_id } = req.params;
  const message_sender = req.user.company_name;

  try {
    const user = await User.query()
      .findById(user_id)
      .where("company_id", req.user.company_id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const message = await PlatformMessage.query().insert({
      platform_message_title,
      platform_message_content,
      message_sender,
      apto_empresa: false,
      user_id: user_id,
      company_id: user.company_id,
    });

    await knex("platform_messages_users").insert({
      platform_message_id: message.platform_message_id,
      user_id: user.user_id,
      is_read: false,
    });

    /*LOGGER*/ await registrarNuevoLog(
      req.user.company_id,
      "Se envio un mensaje privado al usuario " + user.user_complete_name + "."
    );

    sendNotificationToUser(user.user_id, "Nuevo mensaje", platform_message_title, { title: "Fast Track" }, `/dashboard/${user.user_role}/mensajes`);
    res.status(201).json({ message: "Mensaje creado para el usuario." });
  } catch (error) {

    res.status(500).json({ error: "Error creando mensaje para el usuario." });
  }
}

// ---------------------------------------------------------
// Borrar masivamente mensajes generales
// ---------------------------------------------------------
async function deleteCompanyMessagesAsClient(req, res) {
  const { platform_message_id } = req.params;

  try {
    const validateMessage = await PlatformMessage.query()
      .findById(platform_message_id)
      .where("company_id", req.user.company_id);

    if (!validateMessage) {
      return res
        .status(404)
        .json({ error: "Mensaje no se pudo encontrar o ya estaba borrado." });
    }

    await PlatformMessage.query().deleteById(platform_message_id);

    /*LOGGER*/ await registrarNuevoLog(
      req.user.company_id,
      "El mensaje con el titulo " +
      validateMessage.platform_message_title +
      " fue eliminado exitosamente por el usuario " +
      req.user.company_name +
      "."
    );

    res.status(200).json({ message: "Mensaje eliminado." });
  } catch (error) {

    res.status(500).json({ error: "Error al eliminar mensaje." });
  }
}

// ---------------------------------------------------------
// Borrar  mensaje puntual por usuario
// ---------------------------------------------------------

async function deleteSpecificMessagesAsClient(req, res) {
  const { specific_message_id } = req.params;

  try {
    const validMessage = await PlatformMessageUser.query()
      .where({
        id: specific_message_id,
        user_id: req.user.user_id,
      })
      .first();

    if (!validMessage) {
      return res.status(404).json({
        error: "Mensaje no se pudo encontrar o ya estaba borrado.",
      });
    }

    await PlatformMessageUser.query().deleteById(validMessage.id);

    res.status(200).json({ message: "Mensaje eliminado." });
  } catch (error) {

    res.status(500).json({ error: "Error al eliminar mensaje." });
  }
}

// ---------------------------------------------------------
// Marcar mensaje como leido
// ---------------------------------------------------------
async function marAsReadMessageAsClient(req, res) {
  const { specific_message_id } = req.params;

  try {
    const validMessage = await PlatformMessageUser.query()
      .where({
        id: specific_message_id,
        user_id: req.user.user_id,
      })
      .first();

    if (!validMessage) {
      return res.status(404).json({
        error: "El mensaje no ha sido encontrado.",
      });
    }

    if (validMessage.is_read) {
      return res.status(404).json({
        error: "El mensaje ya estaba leido.",
      });
    }

    await PlatformMessageUser.query()
      .where({
        id: specific_message_id,
        user_id: req.user.user_id,
      })
      .update({ is_read: 1 });

    res.status(200).json({ message: "Mensaje marcado como leido." });
  } catch (error) {

    res.status(500).json({ error: "Error al marcando mensaje como leido." });
  }
}

// ---------------------------------------------------------
// Marcar mensaje como leido
// ---------------------------------------------------------
async function marAsUnreadMessageAsClient(req, res) {
  const { specific_message_id } = req.params;

  try {
    const validMessage = await PlatformMessageUser.query()
      .where({
        id: specific_message_id,
        user_id: req.user.user_id,
      })
      .first();

    if (!validMessage) {
      return res.status(404).json({
        error: "El mensaje no ha sido encontrado.",
      });
    }

    if (!validMessage.is_read) {
      return res.status(404).json({
        error: "El mensaje ya estaba como no leido.",
      });
    }

    await PlatformMessageUser.query()
      .where({
        id: specific_message_id,
        user_id: req.user.user_id,
      })
      .update({ is_read: 0 });

    res.status(200).json({ message: "Mensaje marcado como no leido." });
  } catch (error) {

    res.status(500).json({ error: "Error al marcando mensaje como no leido." });
  }
}

// ---------------------------------------------------------
// Ver todos los mensajes
// ---------------------------------------------------------
async function getAllMesagesAsClient(req, res) {
  const requestUser = req.user.user_id;
  try {
    const messages = await PlatformMessageUser.query()
      .select("*")
      .where("user_id", requestUser)
      .orderBy("created_at", "desc")
      .withGraphFetched("platformMessage");

    return res.json(messages);
  } catch (error) {

    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
}

module.exports = {
  createMessageForAllAsAdmin,
  createMessageForCompanyAsAdmin,
  createMessageForUserAsAdmin,
  deleteMessageAsAdmin,

  createMessageForCompanyAsClient,
  createMessageForUserAsClient,
  deleteCompanyMessagesAsClient,
  deleteSpecificMessagesAsClient,

  marAsReadMessageAsClient,
  marAsUnreadMessageAsClient,
  getAllMesagesAsClient,
};
