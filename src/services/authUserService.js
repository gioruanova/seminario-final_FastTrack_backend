const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateTokens, refreshAccessToken } = require("./tokenService");
const userLogController = require("../controllers/UserLogController");
const userController = require("../controllers/userController");
const messageController = require("../controllers/cfv/publicMessagesController");

const { registrarNuevoLog } = require("../controllers/globalLogController");

async function loginUser(email, password) {
  const user = await User.query().findOne({ user_email: email });

  if (!user) return null;
  if (!user.user_status) return { error: "blocked" };

  let company = null;
  if (user.user_role !== "superadmin") {
    company = await user.$relatedQuery("company");
  }

  const valid = await bcrypt.compare(password, user.user_password);

  if (!valid) {
    let fallosPrevios = await userLogController.contarLogsPorUsuario(
      user.user_id
    );

    if (fallosPrevios < 3) {
      await userLogController.registrarIntentoFallido(user.user_id);
      fallosPrevios = await userLogController.contarLogsPorUsuario(
        user.user_id
      );
      return null;
    }

    fallosPrevios = await userLogController.contarLogsPorUsuario(user.user_id);



    if (fallosPrevios == 3) {
      await userController.bloquearUsuarioPorId(user.user_id);
      registrarNuevoLog(
        user.company_id,
        "El usuario " +
        user.user_complete_name +
        " ha sido bloqueado por varios intentos fallidos de ingreso."
      );
      if (user.user_role === "owner") {

        await messageController.createInternalMessageAsPlatform(
          user.user_email,
          `Bloqueo de usuario ${user.user_complete_name}\n` + `Revisar el estado en la opcion <a class="font-medium text-primary hover:underline" href="/dashboard/superadmin/users">usuarios</a>.`,
          "BLOQUEO PROPIETARIO"
        );
      }


      return { error: "blocked" };
    }
  }

  const payload = {
    user_id: user.user_id,
    user_role: user.user_role.toLowerCase(),
    company_id: company?.company_id || null,
    user_email: user.user_email,
    user_name: user.user_complete_name,
    company_name: company?.company_nombre || null,
  };

  const { accessToken, refreshToken } = generateTokens(payload);
  await userLogController.eliminarLogsPorUsuario(user.user_id);


  return {
    accessToken,
    refreshToken,
  };
}

function refreshUserToken(refreshToken) {
  try {
    const decoded = refreshAccessToken(refreshToken);
    return decoded;
  } catch {
    return null;
  }
}

module.exports = { loginUser, refreshUserToken };
