const { enviarLista, enviarError, enviarErrorReclamo, enviarExitoReclamo, enviarExito, enviarNoEncontrado, enviarSinPermiso } = require("../helpers/responseHelpers");

const ReclamoAdminService = require("../services/reclamos/ReclamoAdminService");
const ReclamoOwnerService = require("../services/reclamos/ReclamoOwnerService");
const ReclamoProfesionalService = require("../services/reclamos/ReclamoProfesionalService");
const ReclamoService = require("../services/reclamos/ReclamoService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "Especialidad profesional no encontrada": () => enviarErrorReclamo(res, error.message, 400),
    "Faltan datos obligatorios: reclamo_titulo, reclamo_detalle, especialidad_id, profesional_id, cliente_id, agenda_fecha, agenda_hora_desde": () => enviarErrorReclamo(res, error.message, 400),
    "No existe empresa bajo ese ID": () => enviarErrorReclamo(res, error.message, 400),
    "No existe especialidad bajo ese ID": () => enviarErrorReclamo(res, error.message, 400),
    "No existe profesional bajo ese ID": () => enviarErrorReclamo(res, error.message, 400),
    "No existe cliente bajo ese ID": () => enviarErrorReclamo(res, error.message, 400),
    "La hora hasta debe ser posterior a la hora desde": () => enviarErrorReclamo(res, error.message, 400),
    "No se puede bloquear un horario en el pasado.": () => enviarErrorReclamo(res, error.message, 400),
    "El horario de finalizacion de la agenda es mandatorio": () => enviarErrorReclamo(res, error.message, 400),
    "El profesional no puede recibir citas en estos momentos": () => enviarErrorReclamo(res, error.message, 400),
    "Bloqueo existente en AgendaReclamo": () => enviarErrorReclamo(res, error.message, 400),
    "Reclamo no encontrado": () => enviarNoEncontrado(res, "Reclamo"),
    "La nota es necesaria": () => enviarErrorReclamo(res, error.message, 400),
    "El reclamo ya esta cerrado": () => enviarErrorReclamo(res, error.message, 400),
    "Reclamo no puede ser recordatorio": () => enviarError(res, error.message, 400),
    "La nota de cierre es requerida": () => enviarErrorReclamo(res, error.message, 400),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  console.error("Error en ReclamoController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function getReclamosAsAdmin(req, res) {
  try {
    const companyId = req.query.company_id || req.params.company_id;
    let resultado;

    if (companyId) {
      resultado = await ReclamoAdminService.getReclamosByCompany(companyId);
    } else {
      resultado = await ReclamoAdminService.getReclamos();
    }

    return enviarLista(res, resultado);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createReclamo(req, res) {
  try {
    const role = req.user?.user_role;

    if (role === "owner" || role === "operador") {
      return await createReclamoAsOwner(req, res);
    }

    return enviarSinPermiso(res, "Rol no autorizado para crear reclamos");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createReclamoAsOwner(req, res) {
  try {
    const creator = req.user;
    const data = req.body;
    await ReclamoOwnerService.createReclamo(data, creator);
    return enviarExitoReclamo(res, "Reclamo creado exitosamente", 201);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function recordatorioReclamo(req, res) {
  try {
    const role = req.user?.user_role;

    if (role === "owner" || role === "operador") {
      return await recordatorioReclamoAsOwner(req, res);
    }

    return enviarSinPermiso(res, "Rol no autorizado para enviar recordatorios");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function recordatorioReclamoAsOwner(req, res) {
  try {
    const reclamo_id = parseInt(req.params.reclamo_id, 10);
    await ReclamoOwnerService.sendReminder(reclamo_id);
    return enviarExito(res, "Recordatorio de incidencia enviado correctamente", 200);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getReclamos(req, res) {
  try {
    const role = req.user?.user_role;

    switch (role) {
      case "superadmin":
        return await getReclamosAsAdmin(req, res);
      case "owner":
      case "operador":
        return await getReclamosAsOwner(req, res);
      case "profesional":
        return await getReclamosAsProfesionalHandler(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getReclamosAsOwner(req, res) {
  try {
    const companyId = req.user.company_id;
    const resultado = await ReclamoOwnerService.getReclamos(companyId);
    return enviarLista(res, resultado);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getReclamosAsProfesionalHandler(req, res) {
  try {
    const companyId = req.user.company_id;
    const user_id = req.user.user_id;
    const resultado = await ReclamoProfesionalService.getReclamos(companyId, user_id);
    return enviarLista(res, resultado);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getReclamoById(req, res) {
  try {
    const role = req.user?.user_role;

    switch (role) {
      case "owner":
      case "operador":
        return await getReclamoByIdAsOwner(req, res);
      case "profesional":
        return await getReclamoByIdAsProfesional(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getReclamoByIdAsOwner(req, res) {
  try {
    const companyId = req.user.company_id;
    const reclamo_id = parseInt(req.params.reclamo_id, 10);
    const resultado = await ReclamoOwnerService.getReclamoById(reclamo_id, companyId);
    return enviarLista(res, resultado);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getReclamoByIdAsProfesional(req, res) {
  try {
    const companyId = req.user.company_id;
    const user_id = req.user.user_id;
    const reclamo_id = parseInt(req.params.reclamo_id, 10);
    const reclamo = await ReclamoProfesionalService.getReclamoById(reclamo_id, companyId, user_id);
    return enviarLista(res, reclamo);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateReclamo(req, res) {
  try {
    const role = req.user?.user_role;

    switch (role) {
      case "owner":
      case "operador":
        return await updateReclamoAsOwner(req, res);
      case "profesional":
        return await updateReclamoAsProfesionalHandler(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateReclamoAsOwner(req, res) {
  try {
    const companyId = req.user.company_id;
    const reclamo_id = parseInt(req.params.reclamo_id, 10);
    const data = req.body;
    await ReclamoOwnerService.updateReclamo(reclamo_id, data, companyId);
    return enviarExitoReclamo(res, "Reclamo actualizado correctamente", 200);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateReclamoAsProfesionalHandler(req, res) {
  try {
    const companyId = req.user.company_id;
    const user_id = req.user.user_id;
    const reclamo_id = parseInt(req.params.reclamo_id, 10);
    const data = req.body;
    await ReclamoProfesionalService.updateReclamo(reclamo_id, data, companyId, user_id);
    return enviarExitoReclamo(res, "Reclamo actualizado correctamente", 200);
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { createReclamo, getReclamos, getReclamoById, updateReclamo, recordatorioReclamo, fetchReclamosByCompanyId: ReclamoService.fetchReclamosByCompanyId };

