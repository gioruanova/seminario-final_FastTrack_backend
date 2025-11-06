// -----------------
// CONTROLADOR DE MENSAJES PÚBLICOS
// -----------------

const PublicMessage = require("../../models/cfv/PublicMessage");
const PublicMessageCategory = require("../../models/cfv/PublicMessageCategory");
const User = require("../../models/User");
const { sendNotificationToUser } = require("../notificationController");
const { RecaptchaEnterpriseServiceClient, } = require("@google-cloud/recaptcha-enterprise");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida } = require("../../helpers/responseHelpers");
const { obtenerPorId } = require("../../helpers/registroHelpers");
const path = require("path");

// -----------------
// CREAR MENSAJE INTERNO COMO PLATAFORMA
// -----------------
async function createInternalMessageAsPlatform(email, message_content, type) {
  try {
    const superaAdmins = await User.query().select().where("user_role", "superadmin");
    for (const sa of superaAdmins) {
      const user = await User.query().findById(sa.user_id);
      if (user) {
        await sendNotificationToUser(sa.user_id, type, message_content, { title: "Fast Track" }, `/dashboard/${user.user_role}/users`);
      }
      await PublicMessage.query().insert({
        message_email: email,
        message_source: "PLATFORM",
        message_phone: "N/A",
        message_content: message_content,
        category_id: 0,
        category_original: type,
      });
    }
  } catch (error) {
    console.error("Error en createInternalMessageAsPlatform:", error);
    return null;
  }
}

// -----------------
// CONTROLADORES PUBLIC:
// -----------------

// -----------------
// CREAR NUEVO MENSAJE PÚBLICO
// -----------------
async function createPublicMessage(req, res) {
  try {
    const {
      message_email,
      message_phone,
      message_content,
      category_id,
      recaptchaToken,
    } = req.body;

    if (!message_email || !message_content || !category_id || !recaptchaToken) {
      return enviarSolicitudInvalida(res, "Por favor complete todos los campos obligatorios y el captcha");
    }

    // ============================================
    // BLOQUE DE reCAPTCHA - NO MODIFICAR
    // ============================================
    const projectID = "fast-track-474423";
    const siteKey = process.env.RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      throw new Error("Falta RECAPTCHA_SITE_KEY en las variables de entorno");
    }
    const action = "submit";

    let client;

    if (process.env.DB_HOST === "localhost") {
      // Local: carga desde archivo
      client = new RecaptchaEnterpriseServiceClient({
        keyFilename: path.join(
          __dirname,
          "../../../keys/google-credentials.json"
        ),
      });
    } else {
      // Producción: carga desde variable de entorno
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        throw new Error(
          "Falta GOOGLE_APPLICATION_CREDENTIALS_JSON en producción"
        );
      }
      const credentials = JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      );
      client = new RecaptchaEnterpriseServiceClient({ credentials });
    }

    const request = {
      assessment: {
        event: {
          token: recaptchaToken,
          siteKey,
        },
      },
      parent: client.projectPath(projectID),
    };

    const [response] = await client.createAssessment(request);

    console.log("reCAPTCHA completo:", JSON.stringify(response, null, 2));

    if (!response.tokenProperties?.valid) {
      return res.status(403).json({ error: "Captcha inválido" });
    }

    if (response.tokenProperties.action !== action) {
      console.log(
        "La acción del token no coincide con la esperada:",
        response.tokenProperties.action
      );
      return res.status(403).json({ error: "Captcha acción inválida" });
    }

    const score = response.riskAnalysis?.score ?? 0;
    console.log("Score de riesgo:", score);
    if (score < 0.5) {
      return res
        .status(403)
        .json({ error: "Captcha válido pero riesgo demasiado alto" });
    }
    // ============================================
    // FIN BLOQUE DE reCAPTCHA
    // ============================================

    const categoria = await PublicMessageCategory.query()
      .findById(category_id)
      .where("category_status", true);

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no válida o inactiva" });
    }

    await PublicMessage.query().insert({
      message_email,
      message_phone,
      message_source: "WEB",
      message_content,
      category_id,
      category_original: categoria.category_name,
    });

    const superaAdmins = await User.query().select().where("user_role", "superadmin");
    for (const sa of superaAdmins) {
      const user = await User.query().findById(sa.user_id);
      if (user) {
        await sendNotificationToUser(sa.user_id, "Nuevo contacto", `Nuevo mensaje externo en ${categoria.category_name}`, { title: "Fast Track" }, `/dashboard/${user.user_role}/mensajes`);
      }
    }

    return enviarExito(res, "Mensaje creado correctamente", 201);
  } catch (error) {
    console.error("Error en createPublicMessage:", error);
    return enviarError(res, "Error al crear el mensaje", 500);
  }
}

// -----------------
// CONTROLADORES ADMIN:
// -----------------

// -----------------
// CREAR MENSAJE DE FEEDBACK
// -----------------
async function createFeedbackMessage(req, res) {
  try {
    const { message_content } = req.body;

    if (!message_content) {
      return enviarSolicitudInvalida(res, "Todos los campos son obligatorios");
    }

    console.log("Intentando insertar en BD...");

    const result = await PublicMessage.query().insert({
      message_email: req.user.user_email,
      message_source: "PLATFORM",
      message_phone: "N/A",
      message_content: `EMPRESA: ${req.user.company_name} | Mensaje: ${message_content}`,
      category_id: 0,
      category_original: "Feedback",
    });

    const superaAdmins = await User.query().select().where("user_role", "superadmin");

    for (const sa of superaAdmins) {
      const user = await User.query().findById(sa.user_id);
      if (user) {
        await sendNotificationToUser(sa.user_id, "Feedback recibido", `Feedback recibido de ${req.user.company_name}`, { title: "Fast Track" }, `/dashboard/${user.user_role}/mensajes`);
      }
    }

    return enviarExito(res, "Feedback correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al crear el mensaje", 500);
  }
}

// -----------------
// OBTENER TODOS LOS MENSAJES
// -----------------
async function gettAlMessagesAsAdmin(req, res) {
  try {
    const messages = await PublicMessage.query()
      .select("*")
      .withGraphFetched("category");

    const result = messages.map((msg) => {
      if (!msg.category) {
        const { category, ...rest } = msg;
        return {
          ...rest,
          category_name: "categoria discontinuada",
        };
      }
      return msg;
    });

    return enviarLista(res, result);
  } catch (error) {
    return enviarError(res, "Error al obtener los mensajes", 500);
  }
}

// -----------------
// MARCAR MENSAJE COMO LEÍDO
// -----------------
async function markMessageAsReadAsAdmin(req, res) {
  try {
    const { message_id } = req.params;

    const validacionMensaje = await obtenerPorId(PublicMessage, message_id);

    if (!validacionMensaje) {
      return enviarNoEncontrado(res, "Mensaje");
    }

    if (validacionMensaje.message_read) {
      return enviarSolicitudInvalida(res, "El mensaje ya está marcado como leído");
    }

    await PublicMessage.query()
      .patch({ message_read: true })
      .where({ message_id: message_id });

    return enviarExito(res, "Mensaje marcado como leído");
  } catch (error) {
    return enviarError(res, "Error al marcar el mensaje como leído", 500);
  }
}

// -----------------
// MARCAR MENSAJE COMO NO LEÍDO
// -----------------
async function markMessageAsUnreadAsAdmin(req, res) {
  try {
    const { message_id } = req.params;

    const validacionMensaje = await obtenerPorId(PublicMessage, message_id);

    if (!validacionMensaje) {
      return enviarNoEncontrado(res, "Mensaje");
    }

    if (!validacionMensaje.message_read) {
      return enviarSolicitudInvalida(res, "El mensaje ya está marcado como no leído");
    }

    await PublicMessage.query()
      .patch({ message_read: false })
      .where({ message_id: message_id });

    return enviarExito(res, "Mensaje marcado como no leído");
  } catch (error) {
    return enviarError(res, "Error al marcar el mensaje como leído", 500);
  }
}

// -----------------
// ELIMINAR MENSAJE
// -----------------
async function deleteMessageAsAdmin(req, res) {
  try {
    const { message_id } = req.params;
    const messageToDelete = await PublicMessage.query().deleteById(message_id);

    if (!messageToDelete) {
      return enviarNoEncontrado(res, "Mensaje");
    }

    return enviarExito(res, "Mensaje eliminado correctamente");
  } catch (error) {
    return enviarError(res, "Error al eliminar el mensaje", 500);
  }
}

module.exports = {
  createPublicMessage,
  gettAlMessagesAsAdmin,
  markMessageAsReadAsAdmin,
  markMessageAsUnreadAsAdmin,
  deleteMessageAsAdmin,
  createFeedbackMessage,
  createInternalMessageAsPlatform,
};
