// -----------------
// CONTROLADOR DE RECLAMOS
// -----------------

const Reclamo = require("../models/Reclamo");
const Company = require("../models/Company");
const Especialidad = require("../models/Especialidad");
const ProfesionalEspecialidad = require("../models/ProfesionalesEspecialidad");
const User = require("../models/User");
const ClienteRecurrente = require("../models/ClienteRecurrente");
const disponibilidadController = require("./disponibilidadController");
const AgendaReclamo = require("../models/AgendaReclamo");
const companyConfigController = require("./companyConfigController");
const CompaniesConfig = require("../models/CompaniesConfig");
const { enviarLista, enviarError, enviarErrorReclamo, enviarExitoReclamo, enviarExito, enviarNoEncontrado } = require("../helpers/responseHelpers");
const { obtenerPorId } = require("../helpers/registroHelpers");

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// OBTENER RECLAMOS COMO ADMIN
// -----------------
async function getReclamosAsAdmin(req, res) {
  try {
    const companyId = req.user.company_id;
    const resultado = await fetchReclamosByCompanyId();
    return enviarLista(res, resultado);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER RECLAMOS POR EMPRESA COMO ADMIN
// -----------------
async function getReclamosByCompanyAsAdmin(req, res) {
  try {
    const companyId = req.params.company_id;
    const resultado = await fetchReclamosByCompanyId(companyId);
    return enviarLista(res, resultado);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES):
// -----------------

// -----------------
// CREAR RECLAMO
// -----------------
async function createReclamo(req, res) {
  const creator = req.user;
  const company_id = creator.company_id;
  const data = req.body;

  try {
    const especialidadProfesionalExiste = await ProfesionalEspecialidad.query()
      .where({
        id_usuario: data.profesional_id,
        id_especialidad: data.especialidad_id,
        company_id,
      })
      .first();

    if (!especialidadProfesionalExiste) {
      return enviarErrorReclamo(res, "Especialidad profesional no encontrada", 400);
    }

    const companyConfig =
      await companyConfigController.fetchCompanySettingsByCompanyId(company_id);

    const { valid, error, newAgendaHoraHasta } = validarDatosObligatoriosYHora(
      data,
      companyConfig
    );
    if (!valid) {
      return enviarErrorReclamo(res, error, 400);
    }
    data.agenda_hora_hasta = newAgendaHoraHasta;

    const entidadesValidas = await validarEntidadesRelacionadas(
      company_id,
      data
    );
    if (!entidadesValidas.valid) {
      return enviarErrorReclamo(res, entidadesValidas.error, 400);
    }

    const validacionHorario = validarHorario(data, companyConfig);
    if (!validacionHorario.valid) {
      return enviarErrorReclamo(res, validacionHorario.error, 400);
    }

    // valida disponibilidad en fila de trabajo de usuario profesional
    const profesionalApto = await obtenerPorId(User, data.profesional_id);
    if (!profesionalApto || !profesionalApto.apto_recibir) {
      return enviarErrorReclamo(res, "El profesional no puede recibir citas en estos momentos", 400);
    }

    const disponibilidad = await disponibilidadController.validarDisponibilidad(
      {
        profesional_id: data.profesional_id,
        company_id,
        agenda_fecha: data.agenda_fecha,
        agenda_hora_desde: data.agenda_hora_desde,
        agenda_hora_hasta: data.agenda_hora_hasta,
      }
    );

    if (!disponibilidad.disponible) {
      return enviarErrorReclamo(res, disponibilidad.motivo, 400);
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
    notificacionNuevoReclamo(nuevoReclamo, profesionalUser, creator);

    return enviarExitoReclamo(res, "Reclamo creado exitosamente", 201);
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error creando reclamo", 500);
  }
}

// -----------------
// OBTENER RECLAMOS COMO OWNER/OPERADOR
// -----------------
async function getReclamosAsClient(req, res) {
  try {
    const companyId = req.user.company_id;
    const resultado = await fetchReclamosByCompanyId(companyId);
    return enviarLista(res, resultado);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER RECLAMO POR ID COMO CLIENTE
// -----------------
async function getReclamosAsClientById(req, res) {
  // PENDIENTE: Testear esto
  const companyId = req.user.company_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);
  try {
    const resultado = await fetchReclamosByCompanyId(companyId);

    const reclamo = resultado.find((r) => r.reclamo_id === reclamo_id);
    if (!reclamo) {
      return enviarNoEncontrado(res, "Reclamo");
    }

    return enviarLista(res, resultado);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR RECLAMO COMO OWNER/OPERADOR
// -----------------
async function updateReclamoAsClient(req, res) {
  const companyId = req.user.company_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);

  const { reclamo_nota_cierre, reclamo_presupuesto, reclamo_estado } = req.body;

  if (reclamo_estado === "CERRADO" || reclamo_estado === "CANCELADO") {
    if (!reclamo_nota_cierre) {
      return enviarErrorReclamo(res, "La nota es necesaria", 400);
    }
  }

  try {
    const reclamoExiste = await Reclamo.query()
      .where("reclamo_id", reclamo_id)
      .andWhere("company_id", companyId)
      .first();

    if (!reclamoExiste) {
      return enviarNoEncontrado(res, "Reclamo");
    }

    if (
      reclamoExiste.reclamo_estado === "CERRADO" &&
      reclamo_estado === "CERRADO"
    ) {
      return enviarErrorReclamo(res, "El reclamo ya esta cerrado", 400);
    }

    const reclamoActualizado = await Reclamo.query().patchAndFetchById(
      reclamo_id,
      {
        reclamo_nota_cierre,
        reclamo_presupuesto,
        reclamo_estado,
      }
    );

    const companyConfig = await companyConfigController.fetchCompanySettingsByCompanyId(reclamoExiste.company_id);

    const profesionalUser = await User.query().findById(reclamoExiste.profesional_id);
    actualizacionReclamo(reclamoExiste, profesionalUser, req.user, reclamoActualizado.reclamo_estado);

    return enviarExitoReclamo(res, "Reclamo actualizado correctamente", 200);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA PROFESIONAL:
// -----------------

// -----------------
// OBTENER RECLAMOS COMO PROFESIONAL
// -----------------
async function getReclamosAsProfesional(req, res) {
  const companyId = req.user.company_id;
  const user_id = req.user.user_id;
  try {
    const resultado = await fetchReclamosByCompanyId(companyId, user_id);
    return enviarLista(res, resultado);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER RECLAMO POR ID COMO PROFESIONAL
// -----------------
async function getReclamosAsProfesionalById(req, res) {
  const companyId = req.user.company_id;
  const user_id = req.user.user_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);
  try {
    const resultado = await fetchReclamosByCompanyId(companyId, user_id);

    const reclamo = resultado.find((r) => r.reclamo_id === reclamo_id);
    if (!reclamo) {
      return enviarNoEncontrado(res, "Reclamo");
    }

    return enviarLista(res, reclamo);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR RECLAMO COMO PROFESIONAL
// -----------------
async function updateReclamoAsProfesional(req, res) {
  const companyId = req.user.company_id;
  const user_id = req.user.user_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);

  const { reclamo_nota_cierre, reclamo_presupuesto, reclamo_estado } = req.body;

  if (reclamo_estado === "CERRADO" || reclamo_estado === "CANCELADO") {
    if (!reclamo_nota_cierre) {
      return enviarErrorReclamo(res, "La nota de cierre es requerida", 400);
    }
  }

  try {
    const reclamoExiste = await Reclamo.query()
      .where("reclamo_id", reclamo_id)
      .andWhere("company_id", companyId)
      .first();

    if (!reclamoExiste) {
      return enviarNoEncontrado(res, "Reclamo");
    }

    if (reclamoExiste.reclamo_estado === "CERRADO" || reclamoExiste.reclamo_estado === "CANCELADO") {
      return enviarErrorReclamo(res, "El reclamo ya esta cerrado", 400);
    }

    const reclamoActualizado = await Reclamo.query().patchAndFetchById(
      reclamo_id,
      {
        reclamo_nota_cierre,
        reclamo_presupuesto,
        reclamo_estado,
      }
    );

    if (reclamoActualizado) {
      const resultado = await fetchReclamosByCompanyId(companyId, user_id);

      const companyConfig = await companyConfigController.fetchCompanySettingsByCompanyId(reclamoExiste.company_id);
      const compUsers = await User.query().select().where("user_role", "operador");

      for (const cu of compUsers) {
        const user = await User.query().findById(cu.user_id);
        if (user) {
          actualizacionReclamoOperador(reclamoExiste, user, req.user, reclamoActualizado.reclamo_estado);
        }
      }

      return enviarExitoReclamo(res, "Reclamo actualizado correctamente", 200);
    }
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ENVIAR RECORDATORIO A PROFESIONAL
// -----------------
async function sendReminderToProfesional(req, res) {
  try {
    const reclamo_id = parseInt(req.params.reclamo_id, 10);

    // Buscar el reclamo por ID
    const reclamo = await Reclamo.query()
      .findById(reclamo_id)
      .withGraphFetched("[profesional, company]");

    if (!reclamo) {
      return enviarNoEncontrado(res, "Reclamo");
    }

    // Obtener el profesional
    const profesional = await obtenerPorId(User, reclamo.profesional_id);

    if (!profesional) {
      return enviarNoEncontrado(res, "Profesional");
    }

    // Obtener config de la empresa
    const companyConfig = await CompaniesConfig.query()
      .select()
      .where("company_id", reclamo.company_id)
      .first();

    // Crear mensaje de recordatorio
    const mensajeRecordatorio = `Recordatorio de ${companyConfig.sing_heading_reclamos} pendiente de atender.` +
      "\n\n" +
      "ID: " +
      reclamo.reclamo_id +
      " - " +
      reclamo.reclamo_titulo +
      "\n\n" +
      `Revisa tus ${companyConfig.plu_heading_reclamos} en curso ` + `<a class="font-medium text-primary hover:underline" href="/dashboard/profesional/trabajar-reclamos">aquí</a>.`;

    return enviarExito(res, "Recordatorio enviado al profesional correctamente");
  } catch (error) {
    console.error("Error enviando recordatorio:", error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// HELPERS DE VALIDACIÓN:
// -----------------

// -----------------
// VALIDAR DATOS OBLIGATORIOS Y HORA
// -----------------
function validarDatosObligatoriosYHora(data, companyConfig) {
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
    return {
      valid: false,
      error:
        "Faltan datos obligatorios: reclamo_titulo, reclamo_detalle, especialidad_id, profesional_id, cliente_id, agenda_fecha, agenda_hora_desde" +
        (companyConfig.requiere_url ? ", reclamo_url" : ""),
      newAgendaHoraHasta,
    };
  }

  return { valid: true, error: null, newAgendaHoraHasta };
}

// -----------------
// VALIDAR ENTIDADES RELACIONADAS
// -----------------
async function validarEntidadesRelacionadas(company_id, data) {
  // Empresa
  const company = await obtenerPorId(Company, company_id);
  if (!company) return { valid: false, error: "No existe empresa bajo ese ID" };

  // Especialidad
  const especialidadExiste = await Especialidad.query()
    .findById(data.especialidad_id)
    .where("company_id", company_id);
  if (!especialidadExiste)
    return { valid: false, error: "No existe especialidad bajo ese ID" };

  // Profesional
  const profesionalExiste = await User.query()
    .findById(data.profesional_id)
    .where("user_role", "profesional")
    .where("company_id", company_id);
  if (!profesionalExiste)
    return { valid: false, error: "No existe profesional bajo ese ID" };

  // Cliente
  const clienteExiste = await ClienteRecurrente.query()
    .findById(data.cliente_id)
    .where("company_id", company_id);
  if (!clienteExiste)
    return { valid: false, error: "No existe cliente bajo ese ID" };

  return { valid: true };
}

// -----------------
// VALIDAR HORARIO
// -----------------
function validarHorario(data, companyConfig) {
  if (
    data.agenda_hora_hasta &&
    data.agenda_hora_hasta < data.agenda_hora_desde
  ) {
    return {
      valid: false,
      error: "La hora hasta debe ser posterior a la hora desde",
    };
  }

  const now = new Date();
  const fechaHoraDesde = new Date(
    `${data.agenda_fecha}T${data.agenda_hora_desde}`
  );

  if (fechaHoraDesde <= now) {
    return {
      valid: false,
      error: "No se puede bloquear un horario en el pasado.",
    };
  }

  if (companyConfig.requiere_fecha_final && !data.agenda_hora_hasta) {
    return {
      valid: false,
      error: "El horario de finalizacion de la agenda es mandatorio",
    };
  }

  return { valid: true };
}

// -----------------
// OBTENER RECLAMOS POR COMPANY ID
// -----------------
async function fetchReclamosByCompanyId(_company_id, _user_id) {
  const reclamos = await Reclamo.query()
    .modify((qb) => {
      if (_company_id) {
        qb.andWhere("company_id", _company_id);
      }
    })
    .modify((qb) => {
      if (_user_id) {
        qb.andWhere("profesional_id", _user_id);
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

// -----------------
// HELPERS DE NOTIFICACIÓN:
// -----------------

// -----------------
// NOTIFICACIÓN DE NUEVO RECLAMO
// -----------------
async function notificacionNuevoReclamo(reclamo, user, creator) {
  const companyConfig = await CompaniesConfig.query()
    .select()
    .where("company_id", reclamo.company_id)
    .first();

  const nuevoReclamoMensaje = companyConfig.string_inicio_reclamo_profesional +
    "\n\n" +
    "ID: " +
    reclamo.reclamo_id +
    " - " +
    reclamo.reclamo_titulo +
    "\n\n" +
    `Revisa tus ${companyConfig.plu_heading_reclamos} en curso ` + `<a class="font-medium text-primary hover:underline" href="/dashboard/profesional/trabajar-reclamos">aquí</a>.`;

}

// -----------------
// NOTIFICACIÓN DE ACTUALIZACIÓN DE RECLAMO
// -----------------
async function actualizacionReclamo(reclamo, user, creator, nuevoEstado) {
  const companyConfig = await CompaniesConfig.query()
    .select()
    .where("company_id", reclamo.company_id)
    .first();

  const estadoReclamo = nuevoEstado == "CERRADO" || nuevoEstado == "CANCELADO" ? { estado: `Revisa tu historial de ${companyConfig.plu_heading_reclamos}`, path: "/dashboard/profesional/historial-reclamos" } : { estado: `Revisa tus ${companyConfig.plu_heading_reclamos} en curso `, path: "/dashboard/profesional/trabajar-reclamos" };
  const nuevoReclamoMensaje = companyConfig.string_actualizacion_reclamo_profesional +
    "\n\n" +
    "ID: " +
    reclamo.reclamo_id +
    " - " +
    reclamo.reclamo_titulo +
    "\n\n" +
    `${estadoReclamo.estado} ` + `<a class="font-medium text-primary hover:underline" href="${estadoReclamo.path}">aquí</a>.`;

}

// -----------------
// NOTIFICACIÓN DE ACTUALIZACIÓN DE RECLAMO PARA OPERADORES
// -----------------
async function actualizacionReclamoOperador(reclamo, user, creator, nuevoEstado) {
  const companyConfig = await CompaniesConfig.query()
    .select()
    .where("company_id", reclamo.company_id)
    .first();

  const estadoReclamo = nuevoEstado == "CERRADO" || nuevoEstado == "CANCELADO" ? { estado: `Revisa el historial de ${companyConfig.plu_heading_reclamos} de la empresa`, path: "/dashboard/operador/historial-reclamos" } : { estado: `Revisa el reporte de  ${companyConfig.plu_heading_reclamos} en curso `, path: "/dashboard/operador/trabajar-reclamos" };

  const userNameProfesional = await User.query().findById(reclamo.profesional_id);

  const nuevoReclamoMensaje = `Se registro actualizacion en  ${companyConfig.sing_heading_reclamos} con asignacion al ${companyConfig.sing_heading_profesional}: ${userNameProfesional.user_complete_name}. ` +
    "\n\n" +
    "ID: " +
    reclamo.reclamo_id +
    " - " +
    reclamo.reclamo_titulo +
    "\n\n" +
    `${estadoReclamo.estado} ` + `<a class="font-medium text-primary hover:underline" href="${estadoReclamo.path}">aquí</a>.`;

}

module.exports = {
  getReclamosAsAdmin,
  getReclamosByCompanyAsAdmin,

  createReclamo,
  getReclamosAsClient,
  getReclamosAsClientById,
  updateReclamoAsClient,
  sendReminderToProfesional,

  getReclamosAsProfesional,
  getReclamosAsProfesionalById,
  updateReclamoAsProfesional,

  fetchReclamosByCompanyId,
};
