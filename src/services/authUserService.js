const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateTokens, refreshAccessToken } = require("./tokenService");
const UserLogController = require("../controllers/UserLogController");
const userController = require("../controllers/userController");

async function loginUser(email, password) {
  const user = await User.query().findOne({ user_email: email });

  if (!user) {
    // Usuario no existe
    console.log("Usuario no encontrado");
    return null;
  }

  if (!user.user_status) {
    console.log("Usuario bloqueado");
    return { error: "blocked" };
  }

  const valid = await bcrypt.compare(password, user.user_password);

  if (!valid) {
    let fallosPrevios = await UserLogController.contarLogsPorUsuario(
      user.user_id
    );

    if (fallosPrevios < 3) {
      await UserLogController.registrarIntentoFallido(user.user_id);
      fallosPrevios = await UserLogController.contarLogsPorUsuario(
        user.user_id
      );
      return null;
    }

    fallosPrevios = await UserLogController.contarLogsPorUsuario(user.user_id);

    if (fallosPrevios == 3) {
      await userController.bloquearUsuarioPorId(user.user_id);
      return { error: "blocked" };
    }
  }

  const payload = {
    user_id: user.user_id,
    email: user.user_email,
    role: user.user_role,
    company_id: user.company_id,
  };

  const { accessToken, refreshToken } = generateTokens(payload);

  return {
    email: user.user_email,
    role: user.user_role,
    company_id: user.company_id,

    accessToken,
    refreshToken,
  };
}

function refreshUserToken(refreshToken) {
  try {
    const decoded = refreshAccessToken(refreshToken);
    return decoded; // devuelve nuevo accessToken o null
  } catch {
    return null;
  }
}

module.exports = { loginUser, refreshUserToken };
