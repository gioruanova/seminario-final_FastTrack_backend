const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida } = require("../helpers/responseHelpers");
const FeedbackService = require("../services/feedback/FeedbackService");

async function getFeedbacks(req, res) {
  try {
    const { user_id, company_id, user_role } = req.user;
    const feedbacks = await FeedbackService.getFeedbacks(user_id, company_id, user_role);
    return enviarLista(res, feedbacks);
  } catch (error) {
    console.error("Error en getFeedbacks:", error);

    if (error.message === "El usuario debe estar asociado a una empresa") {
      return enviarSolicitudInvalida(res, error.message);
    }

    return enviarError(res, "Error interno del servidor", 500);
  }
}

async function getFeedbackById(req, res) {
  try {
    const { feedback_id } = req.params;
    const { user_id, company_id, user_role } = req.user;

    const feedback = await FeedbackService.getFeedbackById(feedback_id, user_id, company_id, user_role);
    return enviarLista(res, feedback);
  } catch (error) {
    console.error("Error en getFeedbackById:", error);

    if (error.message === "Feedback no encontrado") {
      return enviarSolicitudInvalida(res, error.message);
    }

    if (error.message === "No tienes permiso para ver este feedback") {
      return enviarError(res, error.message, 403);
    }

    return enviarError(res, "Error interno del servidor", 500);
  }
}

async function createFeedback(req, res) {
  try {
    const { user_id, company_id, user_role, user_email } = req.user;
    const { message_content } = req.body;

    await FeedbackService.createFeedback(user_id, company_id, message_content, user_role, user_email);
    return enviarExito(res, "Feedback creado correctamente", 201);
  } catch (error) {
    console.error("Error en createFeedback:", error);

    if (
      error.message === "El campo message_content es obligatorio y no puede estar vacío" ||
      error.message === "Usuario no encontrado" ||
      error.message === "Empresa no encontrada" ||
      error.message === "El usuario debe estar asociado a una empresa para enviar feedback"
    ) {
      return enviarSolicitudInvalida(res, error.message);
    }

    return enviarError(res, "Error interno del servidor", 500);
  }
}

async function deleteFeedback(req, res) {
  try {
    const { feedback_id } = req.params;
    const { user_role } = req.user;

    await FeedbackService.deleteFeedbackById(feedback_id, user_role);
    return enviarExito(res, "Feedback eliminado correctamente");
  } catch (error) {
    console.error("Error en deleteFeedback:", error);

    if (error.message === "Feedback no encontrado") {
      return enviarSolicitudInvalida(res, error.message);
    }

    if (error.message === "No tienes permiso para eliminar este feedback") {
      return enviarError(res, error.message, 403);
    }

    return enviarError(res, "Error interno del servidor", 500);
  }
}

module.exports = { getFeedbacks, getFeedbackById, createFeedback, deleteFeedback, };

