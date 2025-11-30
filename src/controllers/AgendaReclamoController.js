const { enviarLista, enviarError } = require("../helpers/responseHelpers");
const AgendaReclamoService = require("../services/agendaReclamo/AgendaReclamoService");

function manejarError(error, res) {
  console.error("Error en AgendaReclamoController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function getAgendaReclamo(req, res) {
  try {
    const companyId = req.user.company_id;
    const agendaReclamo = await AgendaReclamoService.getAgendaReclamo(companyId);
    return enviarLista(res, agendaReclamo);
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { getAgendaReclamo };

