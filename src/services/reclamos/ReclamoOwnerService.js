const Reclamo = require("../../models/Reclamo");
const AgendaReclamo = require("../../models/AgendaReclamo");
const ProfesionalEspecialidad = require("../../models/ProfesionalesEspecialidad");
const User = require("../../models/User");
const ReclamoService = require("./ReclamoService");
const DisponibilidadService = require("../disponibilidad/DisponibilidadService");
const ConfigService = require("../companyConfig/ConfigService");
const NotificationsService = require("../notifications/NotificationsService");
const { obtenerPorId } = require("../../helpers/registroHelpers");

async function createReclamo(data, creator) {
  const company_id = creator.company_id;

  const especialidadProfesionalExiste = await ProfesionalEspecialidad.query()
    .where({
      id_usuario: data.profesional_id,
      id_especialidad: data.especialidad_id,
      company_id,
    })
    .first();

  if (!especialidadProfesionalExiste) {
    throw new Error("Especialidad profesional no encontrada");
  }

  const companyConfig = await ConfigService.getCompanyConfig(company_id);

  const newAgendaHoraHasta = ReclamoService.validateReclamoData(data, companyConfig);
  data.agenda_hora_hasta = newAgendaHoraHasta;

  await ReclamoService.validateRelatedEntities(company_id, data);

  ReclamoService.validateSchedule(data, companyConfig);

  const profesionalApto = await obtenerPorId(User, data.profesional_id);
  if (!profesionalApto || !profesionalApto.apto_recibir) {
    throw new Error("El profesional no puede recibir citas en estos momentos");
  }

  const disponibilidad = await DisponibilidadService.validarDisponibilidad({
    profesional_id: data.profesional_id,
    company_id,
    agenda_fecha: data.agenda_fecha,
    agenda_hora_desde: data.agenda_hora_desde,
    agenda_hora_hasta: data.agenda_hora_hasta,
  });

  if (!disponibilidad.disponible) {
    throw new Error(disponibilidad.motivo);
  }

  const nuevoReclamoData = {
    reclamo_titulo: data.reclamo_titulo,
    reclamo_detalle: data.reclamo_detalle,
    especialidad_id: data.especialidad_id,
    cliente_id: data.cliente_id,
    creado_por: creator.user_id,
    company_id,
    profesional_id: data.profesional_id,
    reclamo_url: data.reclamo_url,
  };

  const nuevoReclamo = await Reclamo.query().insert(nuevoReclamoData);

  await AgendaReclamo.query().insert({
    agenda_fecha: data.agenda_fecha,
    agenda_hora_desde: data.agenda_hora_desde,
    agenda_hora_hasta: data.agenda_hora_hasta,
    reclamo_id: nuevoReclamo.reclamo_id,
    profesional_id: data.profesional_id,
    company_id,
  });

  const profesionalUser = await User.query().findById(data.profesional_id);

  await NotificationsService.sendNotificationToUser(
    profesionalUser.user_id,
    `Nueva Incidencia Asignada`,
    companyConfig.string_inicio_reclamo_profesional,
  );

  return nuevoReclamo;
}

async function getReclamos(companyId) {
  return await ReclamoService.fetchReclamosByCompanyId(companyId, null);
}

async function getReclamoById(reclamoId, companyId) {
  const resultado = await ReclamoService.fetchReclamosByCompanyId(companyId, null);

  const reclamo = resultado.find((r) => r.reclamo_id === reclamoId);
  if (!reclamo) {
    throw new Error("Reclamo no encontrado");
  }

  return resultado;
}

async function updateReclamo(reclamoId, data, companyId) {
  const { reclamo_nota_cierre, reclamo_presupuesto, reclamo_estado } = data;

  if (reclamo_estado === "CERRADO" || reclamo_estado === "CANCELADO") {
    if (!reclamo_nota_cierre) {
      throw new Error("La nota es necesaria");
    }
  }

  const reclamoExiste = await Reclamo.query()
    .where("reclamo_id", reclamoId)
    .andWhere("company_id", companyId)
    .first();

  if (!reclamoExiste) {
    throw new Error("Reclamo no encontrado");
  }

  if (
    reclamoExiste.reclamo_estado === "CERRADO" &&
    reclamo_estado === "CERRADO"
  ) {
    throw new Error("El reclamo ya esta cerrado");
  }

  const reclamoActualizado = await Reclamo.query().patchAndFetchById(
    reclamoId,
    {
      reclamo_nota_cierre,
      reclamo_presupuesto,
      reclamo_estado,
    }
  );

  const companyConfig = await ConfigService.getCompanyConfig(reclamoExiste.company_id);

  const profesionalUser = await User.query().findById(reclamoExiste.profesional_id);

  await NotificationsService.sendNotificationToUser(
    profesionalUser.user_id,
    `Actualizacion en Incidencia`,
    companyConfig.string_actualizacion_reclamo_profesional,
  );

  return reclamoActualizado;
}

async function sendReminder(reclamoId) {
  const reclamo = await Reclamo.query().findById(reclamoId);
  if (!reclamo) {
    throw new Error("Reclamo no encontrado");
  }

  if (reclamo.reclamo_estado === "CANCELADO" || reclamo.reclamo_estado === "CERRADO") {
    throw new Error("Reclamo no puede ser recordatorio");
  }

  const companyConfig = await ConfigService.getCompanyConfig(reclamo.company_id);
  const profesionalUser = await User.query().findById(reclamo.profesional_id);

  await NotificationsService.sendNotificationToUser(
    profesionalUser.user_id,
    `Recordatorio de incidencia`,
    companyConfig.string_recordatorio_reclamo_profesional,
  );
}

module.exports = { createReclamo, getReclamos, getReclamoById, updateReclamo, sendReminder };

