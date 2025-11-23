const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, enviarSinPermiso } = require("../helpers/responseHelpers");
const FeedbackService = require("../services/feedback/FeedbackService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "El usuario debe estar asociado a una empresa": () => enviarSolicitudInvalida(res, error.message),
    "Feedback no encontrado": () => enviarSolicitudInvalida(res, error.message),
    "No tienes permiso para ver este feedback": () => enviarSinPermiso(res, error.message),
    "No tienes permiso para eliminar este feedback": () => enviarSinPermiso(res, error.message),
    "El campo message_content es obligatorio y no puede estar vacío": () => enviarSolicitudInvalida(res, error.message),
    "Usuario no encontrado": () => enviarSolicitudInvalida(res, error.message),
    "Empresa no encontrada": () => enviarSolicitudInvalida(res, error.message),
    "El usuario debe estar asociado a una empresa para enviar feedback": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  console.error("Error en FeedbackController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function getFeedbacks(req, res) {
  try {
    const { user_id, company_id, user_role } = req.user;
    const feedbacks = await FeedbackService.getFeedbacks(user_id, company_id, user_role);
    return enviarLista(res, feedbacks);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getFeedbackById(req, res) {
  try {
    const { feedback_id } = req.params;
    const { user_id, company_id, user_role } = req.user;

    const feedback = await FeedbackService.getFeedbackById(feedback_id, user_id, company_id, user_role);
    return enviarLista(res, feedback);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createFeedback(req, res) {
  try {
    const { user_id, company_id, user_role, user_email } = req.user;
    const { message_content } = req.body;

    await FeedbackService.createFeedback(user_id, company_id, message_content, user_role, user_email);
    return enviarExito(res, "Feedback creado correctamente", 201);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function deleteFeedback(req, res) {
  try {
    const { feedback_id } = req.params;
    const { user_role } = req.user;

    await FeedbackService.deleteFeedbackById(feedback_id, user_role);
    return enviarExito(res, "Feedback eliminado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { getFeedbacks, getFeedbackById, createFeedback, deleteFeedback, };

