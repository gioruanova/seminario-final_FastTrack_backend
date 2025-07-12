const UserLog = require("../models/UserLog");

async function contarLogsPorUsuario(user_id) {
  const result = await UserLog.query()
    .where({ user_id })
    .count("user_id as count")
    .first();
  return parseInt(result.count, 10) || 0;
}

async function registrarIntentoFallido(user_id) {
  return await UserLog.query().insert({ user_id });
}

async function deleteLogByYserid(user_id) {
  return await UserLog.query().delete().where({ user_id })
}

module.exports = {
  contarLogsPorUsuario,
  registrarIntentoFallido,
  deleteLogByYserid
};
