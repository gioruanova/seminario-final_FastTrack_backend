const AgendaReclamo = require("../../models/AgendaReclamo");

async function getDisponibilidadBloqueadaByProfesional(companyId, profesionalId) {
  const bloqueosPorReclamo = await AgendaReclamo.query()
    .where("company_id", companyId)
    .andWhere("profesional_id", profesionalId);

  const bloqueos = bloqueosPorReclamo.map((b) => ({
    origen: "reclamo",
    fecha: b.agenda_fecha,
    desde: b.agenda_hora_desde,
    hasta: b.agenda_hora_hasta,
  }));

  return bloqueos;
}

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

module.exports = { getDisponibilidadBloqueadaByProfesional, validarDisponibilidad };

