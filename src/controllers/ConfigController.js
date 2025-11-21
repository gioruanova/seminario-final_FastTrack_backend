const { enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida } = require("../helpers/responseHelpers");
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

    if (role === "owner" || role === "operador" || role === "profesional") {
      return await getCompanyConfigAsClient(req, res, companyId);
    }
    return enviarError(res, "Rol no autorizado", 403);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateCompanyConfig(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";
    if (role === "owner") {
      return await updateCompanyConfigAsOwner(req, res);
    }
    return enviarError(res, "Rol no autorizado", 403);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getCompanyConfigAsClient(req, res, companyId) {
  const config = await ConfigService.getCompanyConfig(companyId);
  return res.json(config);
}

async function updateCompanyConfigAsOwner(req, res) {
  const companyId = req.user.company_id;
  await ConfigService.updateCompanyConfig(companyId, req.body);
  return enviarExito(res, "Configuración actualizada.");
}

module.exports = { getCompanyConfig, updateCompanyConfig, };
