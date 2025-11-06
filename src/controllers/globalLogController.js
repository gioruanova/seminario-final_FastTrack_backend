// -----------------
// CONTROLADOR DE LOGS GLOBALES
// -----------------
const LogGlobal = require("../models/LogGlobal");
const { enviarLista, enviarExito, enviarError } = require("../helpers/responseHelpers");

// -----------------
// REGISTRAR NUEVO LOG
// -----------------
async function registrarNuevoLog(company_id, log_detalle) {
  try {
    await LogGlobal.query().insert({
      log_company_id: company_id,
      log_detalle,
      log_leido: false,
    });
  } catch (error) {
    throw error;
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES)E:
// -----------------

// -----------------
// OBTENER TODOS LOS LOGS DE LA EMPRESA
// -----------------
async function getAllLogsAsClient(req, res) {
  const company_id = req.user.company_id;
  try {
    const logs = await LogGlobal.query()
      .select("*")
      .where("log_company_id", company_id);
    return enviarLista(res, logs);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// MARCAR TODOS LOS LOGS COMO LEÍDOS
// -----------------
async function markAllLogsAsReadAsClient(req, res) {
  const company_id = req.user.company_id;
  try {
    await LogGlobal.query()
      .patch({ log_leido: true })
      .where("log_company_id", company_id);
    return enviarExito(res, "Logs marcados como leídos");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// MARCAR TODOS LOS LOGS COMO NO LEÍDOS
// -----------------
async function markAllLogsAsUnreadAsClient(req, res) {
  const company_id = req.user.company_id;
  try {
    await LogGlobal.query()
      .patch({ log_leido: false })
      .where("log_company_id", company_id);
    return enviarExito(res, "Logs marcados como no leídos");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ELIMINAR TODOS LOS LOGS DE LA EMPRESA
// -----------------
async function deleteLogsAsClient(req, res) {
  const company_id = req.user.company_id;
  try {
    await LogGlobal.query().delete().where("log_company_id", company_id);
    return enviarExito(res, "Logs eliminados");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// OBTENER TODOS LOS LOGS
// -----------------
async function getAllLogsAsAdmin(req, res) {
  try {
    const logs = await LogGlobal.query().select("*");
    return enviarLista(res, logs);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER LOGS POR EMPRESA
// -----------------
async function getAllLogsByCompanyAsAdmin(req, res) {
  try {
    const logs = await LogGlobal.query()
      .select("*")
      .where("log_company_id", req.params.company_id);
    return enviarLista(res, logs);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

module.exports = {
  getAllLogsAsAdmin,
  registrarNuevoLog,
  getAllLogsByCompanyAsAdmin,

  getAllLogsAsClient,
  markAllLogsAsReadAsClient,
  markAllLogsAsUnreadAsClient,
  deleteLogsAsClient
};
