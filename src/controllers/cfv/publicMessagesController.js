const PublicMessage = require("../../models/cfv/PublicMessage");
const {
  RecaptchaEnterpriseServiceClient,
} = require("@google-cloud/recaptcha-enterprise");

const PublicMessageCategory = require("../../models/cfv/PublicMessageCategory");
const path = require("path");

// CONTROLADORES PUBLIC:
// ---------------------------------------------------------
// Crear nuevo mensaje
// ---------------------------------------------------------

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
      return res.status(400).json({
        error: "Por favor complete todos los campos obligatorios y el captcha",
      });
    }

    const projectID = "service-now-6979c";
    const siteKey = "6LdL_pErAAAAALtFUHN1Rs4MgJbF6xBv_CDKdVMr";
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
      console.log("Token inválido:", response.tokenProperties.invalidReason);
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

    return res
      .status(201)
      .json({ success: true, message: "Mensaje creado correctamente" });
  } catch (error) {
    console.error("Error en createPublicMessage:", error);
    return res.status(500).json({ error: "Error al crear el mensaje" });
  }
}

// CONTROLADORES ADMIN:
// ---------------------------------------------------------
// ---------------------------------------------------------
// Traer todos los mensajes
// ---------------------------------------------------------
async function createFeedbackMessage(req, res) {
  try {
    const { message_content } = req.body;

    if (!message_content) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    await PublicMessage.query().insert({
      message_email: req.user.user_email,
      message_source: "PLATFORM",
      message_phone: "N/A",
      message_content: `EMPRESA | ${req.user.company_name} ${message_content}`,
      category_id: 0,
      category_original: "Feedback",
    });

    return res
      .status(201)
      .json({ success: true, message: "Feedback correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al crear el mensaje" });
  }
}
// ---------------------------------------------------------
// Traer todos los mensajes
// ---------------------------------------------------------
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

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener los mensajes" });
  }
}
// ---------------------------------------------------------
// Marcar mensaje como leido
// ---------------------------------------------------------
async function markMessageAsReadAsAdmin(req, res) {
  try {
    const { message_id } = req.params;

    const validacionMensaje = await PublicMessage.query().findById(message_id);

    if (validacionMensaje.message_read) {
      return res
        .status(400)
        .json({ error: "El mensaje ya está marcado como leído" });
    }

    await PublicMessage.query()
      .patch({ message_read: true })
      .where({ message_id: message_id });
    return res
      .status(200)
      .json({ success: true, message: "Mensaje marcado como leído" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al marcar el mensaje como leído" });
  }
}

// ---------------------------------------------------------
// Marcar mensaje como no leido
// ---------------------------------------------------------
async function markMessageAsUnreadAsAdmin(req, res) {
  try {
    const { message_id } = req.params;

    const validacionMensaje = await PublicMessage.query().findById(message_id);

    if (!validacionMensaje.message_read) {
      return res
        .status(400)
        .json({ error: "El mensaje ya está marcado como no leído" });
    }
    await PublicMessage.query()
      .patch({ message_read: false })
      .where({ message_id: message_id });
    return res
      .status(200)
      .json({ success: true, message: "Mensaje marcado como no leído" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al marcar el mensaje como leído" });
  }
}

// ---------------------------------------------------------
// Borrar mensaje
// ---------------------------------------------------------

async function deleteMessageAsAdmin(req, res) {
  try {
    const { message_id } = req.params;
    const messageToDelete = await PublicMessage.query().deleteById(message_id);

    if (!messageToDelete) {
      return res.status(404).json({ error: "Mensaje no encontrado" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Mensaje eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar el mensaje" });
  }
}

module.exports = {
  createPublicMessage,
  gettAlMessagesAsAdmin,
  markMessageAsReadAsAdmin,
  markMessageAsUnreadAsAdmin,
  deleteMessageAsAdmin,
  createFeedbackMessage,
};
