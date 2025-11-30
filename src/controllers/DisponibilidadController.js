const { enviarError, enviarExitoConDatos } = require("../helpers/responseHelpers");
const DisponibilidadService = require("../services/disponibilidad/DisponibilidadService");

function manejarError(error, res) {
  console.error("Error en DisponibilidadController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function getDisponibilidadBloqueadaByProfesioanlAsAdmin(req, res) {
  try {
    const companyId = req.user.company_id;
    const userId = req.params.user_id;

    const bloqueos = await DisponibilidadService.getDisponibilidadBloqueadaByProfesional(
      companyId,
      userId
    );

    return enviarExitoConDatos(res, { bloqueos }, "", 200);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function validarDisponibilidad({ profesional_id, company_id, agenda_fecha, agenda_hora_desde, agenda_hora_hasta }) {
  return await DisponibilidadService.validarDisponibilidad({
    profesional_id,
    company_id,
    agenda_fecha,
    agenda_hora_desde,
    agenda_hora_hasta,
  });
}

module.exports = { getDisponibilidadBloqueadaByProfesioanlAsAdmin, validarDisponibilidad };

