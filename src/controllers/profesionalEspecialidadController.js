const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, enviarNoEncontrado, enviarConflicto } = require("../helpers/responseHelpers");
const ProfesionalEspecialidadAdminService = require("../services/profesionalEspecialidad/ProfesionalEspecialidadAdminService");
const ProfesionalEspecialidadOwnerService = require("../services/profesionalEspecialidad/ProfesionalEspecialidadOwnerService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "La especialidad ya esta asignada al profesional": () => enviarConflicto(res, error.message),
    "Especialidad inactiva": () => enviarSolicitudInvalida(res, error.message),
    "Profesional no encontrado": () => enviarNoEncontrado(res, "Profesional"),
    "Especialidad no encontrada": () => enviarNoEncontrado(res, "Especialidad"),
    "Asignación de Especialidad-Profesional no encontrada": () => enviarNoEncontrado(res, "Asignación de Especialidad-Profesional"),
    "El profesional y la especialidad son requeridos": () => enviarSolicitudInvalida(res, error.message),
    "Es necesario el id del profesional y la especialidad": () => enviarSolicitudInvalida(res, error.message),
    "Es necesario el id de la asignacion": () => enviarSolicitudInvalida(res, error.message),
    "Es necesario el id de la especialidad": () => enviarSolicitudInvalida(res, error.message),
    "Company ID no encontrado": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  console.error("Error en profesionalEspecialidadController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function getAsignaciones(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    if (role === "superadmin") {
      return enviarError(res, "Superadmin no tiene endpoint para obtener asignaciones", 403);
    }

    if (role === "owner" || role === "operador") {
      return await getAsignacionesAsOwner(req, res);
    }

    return enviarError(res, "Rol no autorizado", 403);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function assignEspecialidad(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await assignEspecialidadAsAdmin(req, res);
      case "owner":
      case "operador":
        return await assignEspecialidadAsOwner(req, res);
      default:
        return enviarError(res, "Rol no autorizado", 403);
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function deleteAsignacion(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await deleteAsignacionAsAdmin(req, res);
      case "owner":
      case "operador":
        return await deleteAsignacionAsOwner(req, res);
      default:
        return enviarError(res, "Rol no autorizado", 403);
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateAsignacion(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await updateAsignacionAsAdmin(req, res);
      case "owner":
      case "operador":
        return await updateAsignacionAsOwner(req, res);
      default:
        return enviarError(res, "Rol no autorizado", 403);
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function assignEspecialidadAsAdmin(req, res) {
  const data = req.body;
  await ProfesionalEspecialidadAdminService.assignEspecialidad(data);
  return enviarExito(res, "Especialidad asignada correctamente", 201);
}

async function deleteAsignacionAsAdmin(req, res) {
  const { asignacion_id } = req.params;
  await ProfesionalEspecialidadAdminService.deleteAsignacion(asignacion_id);
  return enviarExito(res, "Especialidad eliminada correctamente", 201);
}

async function updateAsignacionAsAdmin(req, res) {
  const { asignacion_id } = req.params;
  const data = req.body;
  await ProfesionalEspecialidadAdminService.updateAsignacion(asignacion_id, data);
  return enviarExito(res, "Asignacion actualizada correctamente", 201);
}

async function getAsignacionesAsOwner(req, res) {
  const company_id = req.user?.company_id;
  if (!company_id) {
    return enviarSolicitudInvalida(res, "Company ID no encontrado");
  }
  const asignaciones = await ProfesionalEspecialidadOwnerService.getAsignaciones(company_id);
  return enviarLista(res, asignaciones);
}

async function assignEspecialidadAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const data = req.body;
  await ProfesionalEspecialidadOwnerService.assignEspecialidad(data, company_id);
  return enviarExito(res, "Especialidad asignada correctamente", 201);
}

async function deleteAsignacionAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const { asignacion_id } = req.params;
  await ProfesionalEspecialidadOwnerService.deleteAsignacion(asignacion_id, company_id);
  return enviarExito(res, "Asignacion eliminada correctamente", 201);
}

async function updateAsignacionAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const { asignacion_id } = req.params;
  const data = req.body;
  await ProfesionalEspecialidadOwnerService.updateAsignacion(asignacion_id, data, company_id);
  return enviarExito(res, "Asignacion editada correctamente", 201);
}

module.exports = { getAsignaciones, assignEspecialidad, deleteAsignacion, updateAsignacion, };
