const { enviarExito, enviarError, enviarSolicitudInvalida, enviarConflicto, enviarNoEncontrado, } = require("../helpers/responseHelpers");
const ProfileService = require("../services/profile/ProfileService");

// -----------------
// HELPER PARA MANEJAR ERRORES
// -----------------
function manejarError(error, res) {
  const mensajesConocidos = {
    "El email ya está registrado": () => enviarConflicto(res, error.message),
    "El DNI ya está registrado": () => enviarConflicto(res, error.message),
    "No existe usuario bajo ese ID": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

// -----------------
// OBTENER PERFIL PROPIO
// -----------------
async function getProfile(req, res) {
  try {
    const userId = req.user.user_id;
    const profileData = await ProfileService.getProfile(userId);
    return res.json(profileData);
  } catch (error) {
    if (error.message === "No existe usuario bajo ese ID") {
      return enviarNoEncontrado(res, "Usuario");
    }
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR PERFIL PROPIO
// -----------------
async function updateProfile(req, res) {
  try {
    const userId = req.user.user_id;
    const companyId = req.user.company_id;

    await ProfileService.updateProfile(userId, req.body, companyId);
    return enviarExito(res, "Usuario editado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { getProfile, updateProfile, };

