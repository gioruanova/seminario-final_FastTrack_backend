const ConfigService = require("../services/companyConfig/ConfigService");
const { enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida } = require("../helpers/responseHelpers");

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

async function createCompanyConfigAsAdmin(data) {
  const companyConfig = await ConfigService.createCompanyConfig(data.company_id);
  return companyConfig;
}

async function getCompanySettingsByClientForOwner(req, res) {
  const company_id = req.user.company_id;
  try {
    const companyConfig = await ConfigService.getCompanyConfig(company_id);
    return res.json(companyConfig);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getCompanySettingsByClient(req, res) {
  const company_id = req.user.company_id;
  try {
    const companyConfig = await ConfigService.getCompanyConfig(company_id);
    return res.json(companyConfig);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateCompanySettingsByClient(req, res) {
  const company_id = req.user.company_id;
  const data = { ...req.body };
  try {
    await ConfigService.updateCompanyConfig(company_id, data);
    return enviarExito(res, "Configuración actualizada.");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function fetchCompanySettingsByCompanyId(company_id) {
  try {
    return await ConfigService.getCompanyConfig(company_id);
  } catch (error) {
    return null;
  }
}

module.exports = {
  createCompanyConfigAsAdmin,
  getCompanySettingsByClient,
  getCompanySettingsByClientForOwner,
  updateCompanySettingsByClient,
  fetchCompanySettingsByCompanyId,
};
