const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida, enviarSinPermiso } = require("../helpers/responseHelpers");
const ConfigService = require("../services/companyConfig/ConfigService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "No existe configuración para esta empresa": () => enviarNoEncontrado(res, "Configuración de empresa"),
    "Se han recibido campos vacíos. Revalidar": () => enviarSolicitudInvalida(res, error.message),
    "No se proporcionaron campos para actualizar": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

async function getCompanyConfig(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";
    const companyId = req.user.company_id;

    switch (role) {
      case "owner":
      case "operador":
      case "profesional":
        return await getCompanyConfigAsClient(req, res, companyId);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateCompanyConfig(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "owner":
        return await updateCompanyConfigAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para actualizar configuración");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getCompanyConfigAsClient(req, res, companyId) {
  const config = await ConfigService.getCompanyConfig(companyId);
  return enviarLista(res, config);
}

async function updateCompanyConfigAsOwner(req, res) {
  const companyId = req.user.company_id;
  await ConfigService.updateCompanyConfig(companyId, req.body);
  return enviarExito(res, "Configuración actualizada.");
}

module.exports = { getCompanyConfig, updateCompanyConfig, };
