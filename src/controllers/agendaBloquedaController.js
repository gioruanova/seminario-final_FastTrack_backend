const AgendaBloqueada = require("../models/AgendaBloqueada");
const User = require("../models/User");
const companyConfigController = require("./companyConfigController");

const { registrarNuevoLog } = require("../controllers/globalLogController");

// CONTROLADORES PARA CLIENTE:
// ---------------------------------------------------------
// Obtener tiempos bloqueados
// ---------------------------------------------------------
async function getAllAgendaBloqueadaAsClient(req, res) {
  const companyId = req.user.company_id;

  try {
    const agendaBloqueada = await AgendaBloqueada.query().where({
      company_id: companyId,
    });
    return res.json(agendaBloqueada);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Crear un bloqueo (como owner u operador)
// ---------------------------------------------------------
async function createAgendaBloqueadaAsClient(req, res) {
  const companyId = req.user.company_id;
  const userId = parseInt(req.params.user_id, 10);

  const { agenda_fecha, agenda_hora_desde, agenda_hora_hasta, agenda_notas } =
    req.body;

  if (!agenda_fecha || !agenda_hora_desde || !companyId || !userId) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const aptoRecibir = await User.query().where("user_id", userId).first();
  if (!aptoRecibir) {
    return res.status(400).json({ error: "Profesional no encontrado" });
  }

  if (!aptoRecibir.apto_recibir) {
    throw new Error("El profesional no puede recibir citas en estos momentos");
  }

  try {
    const nuevoBloqueo = await bloquearHorario({
      agenda_fecha,
      agenda_hora_desde,
      agenda_hora_hasta,
      profesional_id: userId,
      company_id: companyId,
      agenda_notas,
    });

    return res.status(201).json(nuevoBloqueo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// CONTROLADORES PARA PROFESIONAL:
// ---------------------------------------------------------
// Crear un bloqueo (como owner u operador)
// ---------------------------------------------------------
async function createAgendaBloqueadaAsProfesional(req, res) {
  const companyId = req.user.company_id;
  const userId = req.user.user_id;

  const { agenda_fecha, agenda_hora_desde, agenda_hora_hasta, agenda_notas } =
    req.body;

  if (!agenda_fecha || !agenda_hora_desde || !companyId || !userId) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const nuevoBloqueo = await bloquearHorario({
      agenda_fecha,
      agenda_hora_desde,
      agenda_hora_hasta,
      profesional_id: userId,
      company_id: companyId,
      agenda_notas,
    });
    return res.status(201).json(nuevoBloqueo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// ---------------------------------------------------------
// Obtener tiempos bloqueados por id
// ---------------------------------------------------------
async function getAllAgendaBloqueadaAsProfesional(req, res) {
  const companyId = req.user.company_id;
  const userId = req.user.user_id;

  try {
    const agendaBloqueada = await AgendaBloqueada.query().where({
      company_id: companyId,
      profesional_id: userId,
    });
    return res.json(agendaBloqueada);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor", error });
  }
}
// ----------------------------------------
// HELPERS
// ----------------------------------------
// Función reusable de negocio para bloquear agenda
async function bloquearHorario(data) {
  let new_agenda_hora_hasta = data.agenda_hora_hasta;
  const {
    agenda_fecha,
    agenda_hora_desde,
    agenda_hora_hasta,
    profesional_id,
    company_id,
    agenda_notas,
  } = data;

  if (!agenda_fecha || !agenda_hora_desde || !company_id || !profesional_id) {
    throw new Error("Faltan datos obligatorios");
  }

  if (agenda_hora_hasta && agenda_hora_hasta < agenda_hora_desde) {
    throw new Error("La hora hasta debe ser posterior a la hora desde");
  }

  const now = new Date();
  const fechaHoraDesde = new Date(`${agenda_fecha}T${agenda_hora_desde}`);

  if (fechaHoraDesde <= now) {
    console.log("aca");

    throw new Error("No se puede bloquear un horario en el pasado");
  }

  const requiereFechaFinal =
    await companyConfigController.fetchCompanySettingsByCompanyId(company_id);

  if (requiereFechaFinal.requiere_fecha_final && !agenda_hora_hasta) {
    throw new Error("El horario de finalizacion de la agenda es mandatorio.");
  }

  if (!agenda_hora_hasta) {
    new_agenda_hora_hasta = "23:59" + ":59";
  }

  const existeCruce = await AgendaBloqueada.query()
    .where("profesional_id", profesional_id)
    .andWhere("company_id", company_id)
    .andWhere("agenda_fecha", agenda_fecha)
    .andWhere((qb) => {
      qb.where("agenda_hora_desde", "<", new_agenda_hora_hasta).andWhere(
        "agenda_hora_hasta",
        ">",
        agenda_hora_desde
      );
    })
    .first();

  if (existeCruce) {
    throw new Error("Ya existe un bloqueo en ese rango horario");
  }

  const nuevoBloqueo = await AgendaBloqueada.query().insert({
    agenda_fecha,
    agenda_hora_desde,
    agenda_hora_hasta: new_agenda_hora_hasta,
    company_id,
    profesional_id,
    agenda_notas,
  });

  const userName = await User.query().where("user_id", profesional_id).first();

  /*LOGGER*/ await registrarNuevoLog(
    company_id,
    `Se ha generado un nuevo bloqueo de agenda para el profesional ${profesional_id} (${userName.user_complete_name})`
  );

  return nuevoBloqueo;
}

module.exports = {
  getAllAgendaBloqueadaAsClient,
  createAgendaBloqueadaAsClient,

  createAgendaBloqueadaAsProfesional,
  getAllAgendaBloqueadaAsProfesional,

  // HELPERS
  bloquearHorario,
};
