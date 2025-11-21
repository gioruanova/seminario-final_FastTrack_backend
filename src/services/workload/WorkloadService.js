// -----------------
// SERVICIO DE CARGA DE TRABAJO PROFESIONAL
// -----------------
const User = require("../../models/User");
const { obtenerPorId } = require("../../helpers/registroHelpers");

// -----------------
// OBTENER ESTADO DE CARGA DE TRABAJO
// -----------------
async function getWorkloadState(userId) {
  const user = await obtenerPorId(User, userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  
  return {
    enabled: user.apto_recibir == 1,
  };
}

// -----------------
// HABILITAR RECEPCIÓN DE TRABAJO
// -----------------
async function enableWorkload(userId) {
  const user = await obtenerPorId(User, userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.apto_recibir === 1) {
    throw new Error("El profesional ya estaba habilitado para recibir trabajos");
  }

  await User.query().findById(userId).patch({ apto_recibir: true });
  return true;
}

// -----------------
// DESHABILITAR RECEPCIÓN DE TRABAJO
// -----------------
async function disableWorkload(userId) {
  const user = await obtenerPorId(User, userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.apto_recibir === 0) {
    throw new Error("El profesional ya estaba deshabilitado para recibir trabajos");
  }

  await User.query().findById(userId).patch({ apto_recibir: false });
  return true;
}

module.exports = {
  getWorkloadState,
  enableWorkload,
  disableWorkload,
};

