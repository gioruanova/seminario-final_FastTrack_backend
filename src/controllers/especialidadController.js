const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, enviarNoEncontrado, enviarConflicto, enviarSinPermiso } = require("../helpers/responseHelpers");
const EspecialidadAdminService = require("../services/especialidades/EspecialidadAdminService");
const EspecialidadOwnerService = require("../services/especialidades/EspecialidadOwnerService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "La especialidad ya existe para esta empresa": () => enviarConflicto(res, error.message),
    "Ya existe una especialidad con ese nombre": () => enviarConflicto(res, error.message),
    "No existe empresa bajo ese ID": () => enviarSolicitudInvalida(res, error.message),
    "Especialidad no encontrada": () => enviarNoEncontrado(res, "Especialidad"),
    "Especialidad ya esta desactivada": () => enviarSolicitudInvalida(res, error.message),
    "Especialidad ya esta activada": () => enviarSolicitudInvalida(res, error.message),
    "Has alcanzado el limite de especialidades": () => enviarSolicitudInvalida(res, error.message),
    "nombre_especialidad y company_id son requeridos": () => enviarSolicitudInvalida(res, error.message),
    "nombre_especialidad son requeridos": () => enviarSolicitudInvalida(res, error.message),
    "El campo nombre_especialidad es requerido": () => enviarSolicitudInvalida(res, error.message),
    "El campo id_especialidad es requerido": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  console.error("Error en especialidadController:", error);
  return enviarError(res, "Error interno del servidor", 500);
}

async function getEspecialidades(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await getEspecialidadesAsAdmin(req, res);
      case "owner":
      case "operador":
        return await getEspecialidadesAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getEspecialidadesByCompany(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await getEspecialidadesByCompanyAsAdmin(req, res);
      default:
        return enviarSinPermiso(res, "Solo superadmin puede obtener especialidades por empresa");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createEspecialidad(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await createEspecialidadAsAdmin(req, res);
      case "owner":
      case "operador":
        return await createEspecialidadAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateEspecialidad(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await updateEspecialidadAsAdmin(req, res);
      case "owner":
      case "operador":
        return await updateEspecialidadAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function blockEspecialidad(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await blockEspecialidadAsAdmin(req, res);
      case "owner":
      case "operador":
        return await blockEspecialidadAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function unblockEspecialidad(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await unblockEspecialidadAsAdmin(req, res);
      case "owner":
      case "operador":
        return await unblockEspecialidadAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getEspecialidadesAsAdmin(req, res) {
  const especialidades = await EspecialidadAdminService.getAllEspecialidades();
  return enviarLista(res, especialidades);
}

async function getEspecialidadesByCompanyAsAdmin(req, res) {
  const { company_id } = req.params;
  const especialidades = await EspecialidadAdminService.getEspecialidadesByCompany(company_id);
  return enviarLista(res, especialidades);
}

async function createEspecialidadAsAdmin(req, res) {
  const data = req.body;
  await EspecialidadAdminService.createEspecialidad(data);
  return enviarExito(res, "Especialidad creada correctamente", 201);
}

async function updateEspecialidadAsAdmin(req, res) {
  const { especialidad_id } = req.params;
  const data = req.body;
  await EspecialidadAdminService.updateEspecialidad(especialidad_id, data);
  return enviarExito(res, "Especialidad actualizada correctamente");
}

async function blockEspecialidadAsAdmin(req, res) {
  const { especialidad_id } = req.params;
  await EspecialidadAdminService.disableEspecialidad(especialidad_id);
  return enviarExito(res, "Especialidad desactivada correctamente");
}

async function unblockEspecialidadAsAdmin(req, res) {
  const { especialidad_id } = req.params;
  await EspecialidadAdminService.enableEspecialidad(especialidad_id);
  return enviarExito(res, "Especialidad activada correctamente");
}

async function getEspecialidadesAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const especialidades = await EspecialidadOwnerService.getEspecialidadesByCompany(company_id);
  return enviarLista(res, especialidades);
}

async function createEspecialidadAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const data = req.body;
  await EspecialidadOwnerService.createEspecialidad(data, company_id);
  return enviarExito(res, "Especialidad creada correctamente", 201);
}

async function updateEspecialidadAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const { especialidad_id } = req.params;
  const data = req.body;
  await EspecialidadOwnerService.updateEspecialidad(especialidad_id, data, company_id);
  return enviarExito(res, "Especialidad actualizada correctamente");
}

async function blockEspecialidadAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const { especialidad_id } = req.params;
  await EspecialidadOwnerService.disableEspecialidad(especialidad_id, company_id);
  return enviarExito(res, "Especialidad desactivada correctamente");
}

async function unblockEspecialidadAsOwner(req, res) {
  const company_id = req.user?.company_id;
  const { especialidad_id } = req.params;
  await EspecialidadOwnerService.enableEspecialidad(especialidad_id, company_id);
  return enviarExito(res, "Especialidad activada correctamente");
}

module.exports = { getEspecialidades, getEspecialidadesByCompany, createEspecialidad, updateEspecialidad, blockEspecialidad, unblockEspecialidad, };
