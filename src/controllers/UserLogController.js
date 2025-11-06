// -----------------
// CONTROLADOR DE LOGS DE USUARIO
// -----------------
const UserLog = require("../models/UserLog");

// -----------------
// CONTAR INTENTOS FALLIDOS DE UN USUARIO
// -----------------
async function contarLogsPorUsuario(user_id) {
  const result = await UserLog.query()
    .where({ user_id })
    .count("user_id as count")
    .first();
  return parseInt(result.count, 10) || 0;
}

// -----------------
// REGISTRAR INTENTO FALLIDO DE LOGIN
// -----------------
async function registrarIntentoFallido(user_id) {
  return await UserLog.query().insert({ user_id });
}

// -----------------
// ELIMINAR LOGS DE UN USUARIO
// -----------------
async function eliminarLogsPorUsuario(user_id) {
  return await UserLog.query().delete().where({ user_id });
}

module.exports = {
  contarLogsPorUsuario,
  registrarIntentoFallido,
  eliminarLogsPorUsuario,
};
