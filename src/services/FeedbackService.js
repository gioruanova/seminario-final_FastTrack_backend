const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Company = require("../models/Company");

// -----------------
// CREAR FEEDBACK
// -----------------
async function createFeedback(user_id, company_id, message_content, user_role, user_email) {
  if (!message_content || typeof message_content !== "string" || message_content.trim() === "") {
    throw new Error("El campo message_content es obligatorio y no puede estar vacío");
  }

  const user = await User.query().findById(user_id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (!company_id) {
    throw new Error("El usuario debe estar asociado a una empresa para enviar feedback");
  }

  const company = await Company.query().findById(company_id);
  if (!company) {
    throw new Error("Empresa no encontrada");
  }

  const feedback = await Feedback.query().insertAndFetch({
    user_id,
    user_name: user.user_complete_name,
    user_role,
    user_email,
    company_id,
    company_name: company.company_nombre,
    feedback_message: message_content.trim(),
  });

  return feedback;
}

// -----------------
// OBTENER FEEDBACKS
// -----------------
async function getFeedbacks(user_id, company_id, user_role) {
  let feedbacks;

  if (user_role === "superadmin") {
    feedbacks = await Feedback.query().orderBy("created_at", "desc");
  } else if (company_id) {
    feedbacks = await Feedback.query()
      .where({ company_id })
      .orderBy("created_at", "desc");
  } else {
    throw new Error("El usuario debe estar asociado a una empresa");
  }

  return feedbacks;
}

// -----------------
// OBTENER FEEDBACK POR ID
// -----------------
async function getFeedbackById(feedback_id, user_id, company_id, user_role) {
  const feedback = await Feedback.query().findById(feedback_id);

  if (!feedback) {
    throw new Error("Feedback no encontrado");
  }

  if (user_role !== "superadmin" && feedback.company_id !== company_id) {
    throw new Error("No tienes permiso para ver este feedback");
  }

  return feedback;
}

// -----------------
// ELIMINAR FEEDBACK POR ID
// -----------------
async function deleteFeedbackById(feedback_id, user_role) {
  const feedback = await Feedback.query().findById(feedback_id);

  if (!feedback) {
    throw new Error("Feedback no encontrado");
  }

  if (user_role !== "superadmin") {
    throw new Error("No tienes permiso para eliminar este feedback");
  }

  await Feedback.query().deleteById(feedback_id);
  return true;
}

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  deleteFeedbackById,
};

