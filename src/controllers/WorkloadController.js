const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, } = require("../helpers/responseHelpers");
const WorkloadService = require("../services/workload/WorkloadService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "Usuario no encontrado": () => enviarSolicitudInvalida(res, error.message),
    "El profesional ya estaba habilitado para recibir trabajos": () =>
      enviarSolicitudInvalida(res, error.message),
    "El profesional ya estaba deshabilitado para recibir trabajos": () =>
      enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

async function getWorkloadState(req, res) {
  try {
    const userId = req.user.user_id;
    const state = await WorkloadService.getWorkloadState(userId);
    return enviarLista(res, state);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function enableWorkload(req, res) {
  try {
    const userId = req.user.user_id;
    await WorkloadService.enableWorkload(userId);
    return enviarExito(res, "Recibir trabajo habilitado");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function disableWorkload(req, res) {
  try {
    const userId = req.user.user_id;
    await WorkloadService.disableWorkload(userId);
    return enviarExito(res, "Recibir trabajo deshabilitado");
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { getWorkloadState, enableWorkload, disableWorkload };

