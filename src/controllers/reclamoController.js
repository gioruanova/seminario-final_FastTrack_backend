const Reclamo = require("../models/Reclamo");
const Company = require("../models/Company");
const Especialidad = require("../models/Especialidad");
const ProfesionalEspecialidad = require("../models/ProfesionalesEspecialidad");
const User = require("../models/User");
const ClienteRecurrente = require("../models/ClienteRecurrente");
const disponibilidadController = require("./disponibilidadController");
const AgendaReclamo = require("../models/AgendaReclamo");
const companyConfigController = require("./companyConfigController");

const { registrarNuevoLog } = require("../controllers/globalLogController");
const { update } = require("../db/knex");
const { sendNotificationToUser } = require("./notificationController");
const CompaniesConfig = require("../models/CompaniesConfig");
const messageController = require("./messageController");

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Obtener reclamos as ADMIN
// ---------------------------------------------------------
async function getReclamosAsAdmin(req, res) {
  try {
    const companyId = req.user.company_id;

    const resultado = await fetchReclamosByCompanyId();

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Obtener reclamos por empresa as ADMIN
// ---------------------------------------------------------
async function getReclamosByCompanyAsAdmin(req, res) {
  try {
    const companyId = req.params.company_id;

    const resultado = await fetchReclamosByCompanyId(companyId);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// CONTROLADORES PARA CLIENT:
// ---------------------------------------------------------
// Crear reclamo
// ---------------------------------------------------------
async function createReclamo(req, res) {
  const creator = req.user;
  const company_id = creator.company_id;
  const data = req.body;

  try {
    // PENDIENTE: Para ver en el FormDataEvent. esta validacion impide asignar un profeisonal y especialidad a un reclamo cuando todavia no existe dicha asignacion
    const especialidadProfesionalExiste = await ProfesionalEspecialidad.query()
      .where({
        id_usuario: data.profesional_id,
        id_especialidad: data.especialidad_id,
        company_id,
      })
      .first();

    if (!especialidadProfesionalExiste) {
      return res
        .status(400)
        .json({ status: 400, error: "Especialidad profesional no encontrada" });
    }

    const companyConfig =
      await companyConfigController.fetchCompanySettingsByCompanyId(company_id);

    const { valid, error, newAgendaHoraHasta } = validarDatosObligatoriosYHora(
      data,
      companyConfig
    );
    if (!valid) {
      return res.status(400).json({ status: 400, error });
    }
    data.agenda_hora_hasta = newAgendaHoraHasta;

    const entidadesValidas = await validarEntidadesRelacionadas(
      company_id,
      data
    );
    if (!entidadesValidas.valid) {
      return res
        .status(400)
        .json({ status: 400, error: entidadesValidas.error });
    }

    const validacionHorario = validarHorario(data, companyConfig);
    if (!validacionHorario.valid) {
      return res
        .status(400)
        .json({ status: 400, error: validacionHorario.error });
    }

    // valida disponibilidad en fila de trabajo de usuario profesional
    const profesionalApto = await User.query().findById(data.profesional_id);
    if (!profesionalApto.apto_recibir) {
      return res
        .status(400)
        .json({ status: 400, error: "El profesional no puede recibir citas en estos momentos" });
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
      return res
        .status(400)
        .json({ status: 400, error: disponibilidad.motivo });
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
    sendNotificationToUser(nuevoReclamo.profesional_id,
      `Asignacion de ${companyConfig.sing_heading_reclamos}`,
      `Detalle: ${nuevoReclamo.reclamo_titulo} - 
      Programado para ${data.agenda_fecha} a las ${data.agenda_hora_desde}
      `,
      { title: "Fast Track" },
      `/dashboard/profesional/trabajar-reclamos`);

    /*LOGGER*/ await registrarNuevoLog(
        company_id,
        `Se ha generado un nuevo reclamo con el ID: ${nuevoReclamo.reclamo_id}`
      );

    return res
      .status(201)
      .json({ status: 201, message: "Reclamo creado exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creando reclamo" });
  }
}
// ---------------------------------------------------------
// Obtener reclamos as Owner/Operador
// ---------------------------------------------------------
async function getReclamosAsClient(req, res) {
  try {
    const companyId = req.user.company_id;

    const resultado = await fetchReclamosByCompanyId(companyId);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getReclamosAsClientById(req, res) {
  // PENDIENTE: Testear esto
  const companyId = req.user.company_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);
  try {
    const resultado = await fetchReclamosByCompanyId(companyId);

    const reclamo = resultado.find((r) => r.reclamo_id === reclamo_id);
    if (!reclamo) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Gestion reclamo como owner / operador
// ---------------------------------------------------------
async function updateReclamoAsClient(req, res) {
  const companyId = req.user.company_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);

  const { reclamo_nota_cierre, reclamo_presupuesto, reclamo_estado } = req.body;

  if (reclamo_estado === "CERRADO" || reclamo_estado === "CANCELADO") {
    if (!reclamo_nota_cierre) {
      return res.status(400).json({ error: "La nota es necesaria" });
    }
  }

  try {
    const reclamoExiste = await Reclamo.query()
      .where("reclamo_id", reclamo_id)
      .andWhere("company_id", companyId)
      .first();
    if (!reclamoExiste) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    if (
      reclamoExiste.reclamo_estado === "CERRADO" &&
      reclamo_estado === "CERRADO"
    ) {
      return res.status(400).json({ error: "El reclamo ya esta cerrado" });
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


    sendNotificationToUser(
      reclamoExiste.profesional_id,
      `Actualizaciones en  ${companyConfig.sing_heading_reclamos}`,
      `Detalle ${companyConfig.sing_heading_reclamos} nro: ${reclamoExiste.reclamo_id} - ${reclamoExiste.reclamo_titulo}`,
      { title: "Fast Track" },
      `/dashboard/profesional/trabajar-reclamos`);


    res.json({
      status: 200,
      message: "Reclamo actualizado correctamente",
    });
  } catch (error) {

    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// CONTROLADORES PARA PROFESIONAL:
// ---------------------------------------------------------
// Obtener reclamos as Profesional
// ---------------------------------------------------------
async function getReclamosAsProfesional(req, res) {
  const companyId = req.user.company_id;
  const user_id = req.user.user_id;
  try {
    const resultado = await fetchReclamosByCompanyId(companyId, user_id);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getReclamosAsProfesionalById(req, res) {
  const companyId = req.user.company_id;
  const user_id = req.user.user_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);
  try {
    const resultado = await fetchReclamosByCompanyId(companyId, user_id);

    const reclamo = resultado.find((r) => r.reclamo_id === reclamo_id);
    if (!reclamo) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Gestion reclamo como profesional
// ---------------------------------------------------------
async function updateReclamoAsProfesional(req, res) {
  const companyId = req.user.company_id;
  const user_id = req.user.user_id;
  const reclamo_id = parseInt(req.params.reclamo_id, 10);

  const { reclamo_nota_cierre, reclamo_presupuesto, reclamo_estado } = req.body;

  if (reclamo_estado === "CERRADO") {
    if (!reclamo_nota_cierre) {
      return res.status(400).json({ error: "La nota de cierre es requerida" });
    }
  }

  try {
    const reclamoExiste = await Reclamo.query()
      .where("reclamo_id", reclamo_id)
      .andWhere("company_id", companyId)
      .first();
    if (!reclamoExiste) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }
    if (reclamoExiste.reclamo_estado === "CERRADO" || reclamo_estado === "CANCELADO") {
      return res.status(400).json({ error: "El reclamo ya esta cerrado" });
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
          await sendNotificationToUser(
            cu.user_id,
            `Actualizaciones en ${companyConfig.sing_heading_reclamos}`,
            `${companyConfig.sing_heading_reclamos} nro: ${reclamoExiste.reclamo_id} - ${reclamoExiste.reclamo_titulo}`,
            { title: "Fast Track" },
            `${reclamoActualizado.reclamo_estado == "CERRADO" || reclamoActualizado.reclamo_estado == "CANCELADO" ? `/dashboard/operador/historial-reclamos` : `/dashboard/operador/trabajar-reclamos`}`);
          actualizacionReclamoOperador(reclamoExiste, user, req.user, reclamoActualizado.reclamo_estado);
        }
      }


      res.json({
        status: 200,
        message: "Reclamo actualizado correctamente",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// --------------------------------------------
// HELPERs
// --------------------------------------------

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

async function validarEntidadesRelacionadas(company_id, data) {
  // Empresa
  const company = await Company.query().findById(company_id);
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



// helper de notificacion para neuvo reclamo
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
    `Vea sus ${companyConfig.plu_heading_reclamos} en curso ` + `<a class="font-medium text-primary hover:underline" href="/dashboard/profesional/trabajar-reclamos">aquí</a>.`;

  await messageController.createMessageCustom({
    platform_message_title: "Nueva asignacion de " + companyConfig.sing_heading_reclamos,
    platform_message_content: nuevoReclamoMensaje,
    user_id: user.user_id,
    company_id: user.company_id,
    company_name: creator.company_name,
  });
}



// helper de notificacion para actalizacion de reclamo
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

  await messageController.createMessageCustom({
    platform_message_title: "Actualizacion de  " + companyConfig.sing_heading_reclamos,
    platform_message_content: nuevoReclamoMensaje,
    user_id: user.user_id,
    company_id: user.company_id,
    company_name: creator.company_name,
  });
}


// helper de notificacion para OPERADORES para actalizacion de reclamo
async function actualizacionReclamoOperador(reclamo, user, creator, nuevoEstado) {

  const companyConfig = await CompaniesConfig.query()
    .select()
    .where("company_id", reclamo.company_id)
    .first();

  const estadoReclamo = nuevoEstado == "CERRADO" || nuevoEstado == "CANCELADO" ?
    { estado: `Revisa el historial de ${companyConfig.plu_heading_reclamos} de la empresa`, path: "/dashboard/operador/historial-reclamos" } :
    { estado: `Revisa el reporte de  ${companyConfig.plu_heading_reclamos} en curso `, path: "/dashboard/operador/trabajar-reclamos" };

  const userNameProfesional = await User.query().findById(reclamo.profesional_id);

  const nuevoReclamoMensaje = `Se registro actualizacion en  ${companyConfig.sing_heading_reclamos} con asignacion al ${companyConfig.sing_heading_profesional}: ${userNameProfesional.user_complete_name}. ` +
    "\n\n" +
    "ID: " +
    reclamo.reclamo_id +
    " - " +
    reclamo.reclamo_titulo +
    "\n\n" +
    `${estadoReclamo.estado} ` + `<a class="font-medium text-primary hover:underline" href="${estadoReclamo.path}">aquí</a>.`;

  await messageController.createMessageCustom({
    platform_message_title: "Accionamiento de   " + companyConfig.sing_heading_reclamos,
    platform_message_content: nuevoReclamoMensaje,
    user_id: user.user_id,
    company_id: user.company_id,
    company_name: creator.company_name,
  });
}



module.exports = {
  getReclamosAsAdmin,
  getReclamosByCompanyAsAdmin,

  createReclamo,
  getReclamosAsClient,
  getReclamosAsClientById,
  updateReclamoAsClient,

  getReclamosAsProfesional,
  getReclamosAsProfesionalById,
  updateReclamoAsProfesional,

  fetchReclamosByCompanyId,
};
