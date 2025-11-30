const Reclamo = require("../../models/Reclamo");
const Company = require("../../models/Company");
const Especialidad = require("../../models/Especialidad");
const User = require("../../models/User");
const ClienteRecurrente = require("../../models/ClienteRecurrente");
const { obtenerPorId } = require("../../helpers/registroHelpers");

function validateReclamoData(data, companyConfig) {
  const newAgendaHoraHasta = data.agenda_hora_hasta || "23:59:59";

  if (
    !data.reclamo_titulo ||
    !data.reclamo_detalle ||
    !data.especialidad_id ||
    !data.cliente_id ||
    !data.profesional_id ||
    !data.agenda_fecha ||
    !data.agenda_hora_desde ||
    (companyConfig.requiere_url && !data.reclamo_url)
  ) {
    throw new Error(
      "Faltan datos obligatorios: reclamo_titulo, reclamo_detalle, especialidad_id, profesional_id, cliente_id, agenda_fecha, agenda_hora_desde" +
      (companyConfig.requiere_url ? ", reclamo_url" : "")
    );
  }

  return newAgendaHoraHasta;
}

async function validateRelatedEntities(company_id, data) {
  const company = await obtenerPorId(Company, company_id);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }

  const especialidadExiste = await Especialidad.query()
    .findById(data.especialidad_id)
    .where("company_id", company_id);
  if (!especialidadExiste) {
    throw new Error("No existe especialidad bajo ese ID");
  }

  const profesionalExiste = await User.query()
    .findById(data.profesional_id)
    .where("user_role", "profesional")
    .where("company_id", company_id);
  if (!profesionalExiste) {
    throw new Error("No existe profesional bajo ese ID");
  }

  const clienteExiste = await ClienteRecurrente.query()
    .findById(data.cliente_id)
    .where("company_id", company_id);
  if (!clienteExiste) {
    throw new Error("No existe cliente bajo ese ID");
  }
}

function validateSchedule(data, companyConfig) {
  if (
    data.agenda_hora_hasta &&
    data.agenda_hora_hasta < data.agenda_hora_desde
  ) {
    throw new Error("La hora hasta debe ser posterior a la hora desde");
  }

  const now = new Date();
  const fechaHoraDesde = new Date(
    `${data.agenda_fecha}T${data.agenda_hora_desde}`
  );

  if (fechaHoraDesde <= now) {
    throw new Error("No se puede bloquear un horario en el pasado.");
  }

  if (companyConfig.requiere_fecha_final && !data.agenda_hora_hasta) {
    throw new Error("El horario de finalizacion de la agenda es mandatorio");
  }
}

async function fetchReclamosByCompanyId(company_id, user_id) {
  const reclamos = await Reclamo.query()
    .modify((qb) => {
      if (company_id) {
        qb.andWhere("company_id", company_id);
      }
    })
    .modify((qb) => {
      if (user_id) {
        qb.andWhere("profesional_id", user_id);
      }
    })
    .withGraphFetched(
      "[especialidad, creador, cliente, profesional, agendaReclamo, company]"
    );

  return reclamos.map((r) => ({
    company_id: r.company?.company_id,
    company_name: r.company?.company_nombre,

    reclamo_id: r.reclamo_id,
    created_at: r.created_at,
    creador: r.creador?.user_complete_name || null,

    reclamo_titulo: r.reclamo_titulo,
    reclamo_detalle: r.reclamo_detalle,
    nombre_especialidad: r.especialidad?.nombre_especialidad || null,

    cliente_id: r.cliente?.cliente_id,
    cliente_complete_name: r.cliente?.cliente_complete_name,
    cliente_dni: r.cliente?.cliente_dni,
    cliente_phone: r.cliente?.cliente_phone,
    cliente_email: r.cliente?.cliente_email,
    cliente_direccion: r.cliente?.cliente_direccion,
    cliente_lat: r.cliente?.cliente_lat,
    cliente_lng: r.cliente?.cliente_lng,
    reclamo_url: r.reclamo_url,
    profesional: r.profesional?.user_complete_name || null,

    agenda_fecha: r.agendaReclamo?.agenda_fecha,
    agenda_hora_desde: r.agendaReclamo?.agenda_hora_desde,
    agenda_hora_hasta: r.agendaReclamo?.agenda_hora_hasta,

    reclamo_estado: r.reclamo_estado,
    reclamo_nota_cierre: r.reclamo_nota_cierre,
    reclamo_presupuesto: r.reclamo_presupuesto,
    updated_at: r.updated_at,
  }));
}

module.exports = { validateReclamoData, validateRelatedEntities, validateSchedule, fetchReclamosByCompanyId };

