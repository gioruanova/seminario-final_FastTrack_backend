// -----------------
// CONTROLADOR DE DISPONIBILIDAD
// -----------------

const AgendaReclamo = require("../models/AgendaReclamo");
const { enviarError, enviarExitoConDatos } = require("../helpers/responseHelpers");

// -----------------
// OBTENER DISPONIBILIDAD BLOQUEADA POR PROFESIONAL
// -----------------
async function getDisponibilidadBloqueadaByProfesioanlAsAdmin(req, res) {
  const companyId = req.user.company_id;
  const userId = req.params.user_id;

  try {
    // Traer reclamos agendados (ya validados)
    const bloqueosPorReclamo = await AgendaReclamo.query()
      .where("company_id", companyId)
      .andWhere("profesional_id", userId);

    // Unir resultados
    const bloqueos = bloqueosPorReclamo.map((b) => ({
      origen: "reclamo",
      fecha: b.agenda_fecha,
      desde: b.agenda_hora_desde,
      hasta: b.agenda_hora_hasta,
    }));

    return enviarExitoConDatos(res, { bloqueos }, "", 200);
  } catch (error) {
    console.error("Error obteniendo disponibilidad bloqueada:", error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// VALIDAR DISPONIBILIDAD
// -----------------
async function validarDisponibilidad({
  profesional_id,
  company_id,
  agenda_fecha,
  agenda_hora_desde,
  agenda_hora_hasta,
}) {
  if (!agenda_fecha || !agenda_hora_desde || !agenda_hora_hasta) {
    throw new Error("Faltan datos obligatorios para validar disponibilidad");
  }

  // Chequeo cruce en AgendaReclamo
  const reclamoExistente = await AgendaReclamo.query()
    .where("profesional_id", profesional_id)
    .andWhere("company_id", company_id)
    .andWhere("agenda_fecha", agenda_fecha)
    .andWhere((qb) => {
      qb.where("agenda_hora_desde", "<", agenda_hora_hasta).andWhere(
        "agenda_hora_hasta",
        ">",
        agenda_hora_desde
      );
    })
    .first();

  if (reclamoExistente) {
    return { disponible: false, motivo: "Bloqueo existente en AgendaReclamo" };
  }

  return { disponible: true };
}

module.exports = {
  getDisponibilidadBloqueadaByProfesioanlAsAdmin,

  validarDisponibilidad,
};
