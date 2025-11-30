const AgendaReclamo = require("../../models/AgendaReclamo");

async function getAgendaReclamo(companyId) {
  const agendaReclamo = await AgendaReclamo.query()
    .select(
      'agenda_reclamo.profesional_id',
      'reclamos.especialidad_id',
      'agenda_reclamo.agenda_fecha',
      'agenda_reclamo.agenda_hora_desde',
      'agenda_reclamo.agenda_hora_hasta'
    )
    .join('reclamos', 'agenda_reclamo.reclamo_id', 'reclamos.reclamo_id')
    .where('agenda_reclamo.company_id', companyId);

  return agendaReclamo;
}

module.exports = { getAgendaReclamo };

