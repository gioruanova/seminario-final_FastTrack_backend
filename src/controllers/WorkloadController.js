const { enviarExito, enviarError, enviarSolicitudInvalida, } = require("../helpers/responseHelpers");
const WorkloadService = require("../services/workload/WorkloadService");

// HELPER PARA MANEJAR ERRORES
// -----------------
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

// -----------------
// OBTENER ESTADO DE CARGA DE TRABAJO
// -----------------
async function getWorkloadState(req, res) {
  try {
    const userId = req.user.user_id;
    const state = await WorkloadService.getWorkloadState(userId);
    return res.json(state);
  } catch (error) {
    return manejarError(error, res);
  }
}

// -----------------
// HABILITAR RECEPCIÓN DE TRABAJO
// -----------------
async function enableWorkload(req, res) {
  try {
    const userId = req.user.user_id;
    await WorkloadService.enableWorkload(userId);
    return enviarExito(res, "Recibir trabajo habilitado");
  } catch (error) {
    return manejarError(error, res);
  }
}

// -----------------
// DESHABILITAR RECEPCIÓN DE TRABAJO
// -----------------
async function disableWorkload(req, res) {
  try {
    const userId = req.user.user_id;
    await WorkloadService.disableWorkload(userId);
    return enviarExito(res, "Recibir trabajo deshabilitado");
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = {  getWorkloadState,  enableWorkload, disableWorkload  };

