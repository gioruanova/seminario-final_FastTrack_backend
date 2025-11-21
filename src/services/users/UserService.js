// -----------------
// SERVICIO BASE DE USUARIOS
// Solo funciones esenciales de BD compartidas
// -----------------
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../../models/User");

// -----------------
// HASH DE CONTRASEÑA
// -----------------
function hashPassword(password) {
  return bcrypt.hashSync(password, saltRounds);
}

// -----------------
// BLOQUEAR USUARIO POR ID
// -----------------
async function blockUser(userId) {
  return await User.query().patchAndFetchById(userId, {
    user_status: false,
  });
}

// -----------------
// DESBLOQUEAR USUARIO POR ID
// -----------------
async function unblockUser(userId) {
  return await User.query().patchAndFetchById(userId, {
    user_status: true,
  });
}

// -----------------
// HABILITAR USUARIO POR ID
// -----------------
async function enableUser(userId) {
  return await User.query().patchAndFetchById(userId, {
    user_status: true,
  });
}

// -----------------
// RESETEAR CONTRASEÑA
// -----------------
async function resetPassword(userId, newPassword) {
  const passwordHash = hashPassword(newPassword);
  await User.query().findById(userId).patch({
    user_password: passwordHash,
  });
}

module.exports = {
  hashPassword,
  blockUser,
  unblockUser,
  enableUser,
  resetPassword,
};

