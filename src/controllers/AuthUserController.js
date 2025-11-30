const { enviarExito, enviarExitoConDatos, enviarError, enviarNoAutenticado, enviarSolicitudInvalida, enviarSinPermiso, } = require("../helpers/responseHelpers");
const { loginUser, refreshUserToken } = require("../services/auth/authUserService");
const ms = require("ms");

function manejarError(error, res) {
  const mensajesConocidos = {
    "Email y password son requeridos": () => enviarSolicitudInvalida(res, error.message),
    "Refresh token es requerido": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);
    if (!result) return enviarNoAutenticado(res, "Credenciales inválidas");

    if (result.error === "blocked") {
      return enviarSinPermiso(res, "Contacte a su administrador");
    }

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_EXPIRATION),
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_REFRESH_EXPIRATION),
    });

    const { accessToken, refreshToken, ...userData } = result;

    return enviarExitoConDatos(res, userData, "Login exitoso", 200);
  } catch (error) {
    return manejarError(error, res);
  }
}

function refreshToken(req, res) {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) {
      throw new Error("Refresh token es requerido");
    }

    const tokenObject = refreshUserToken(tokenFromCookie);
    if (!tokenObject || !tokenObject.accessToken) {
      return enviarNoAutenticado(res, "Refresh token inválido o expirado");
    }

    res.cookie("accessToken", tokenObject.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_EXPIRATION),
    });

    return enviarExitoConDatos(res, {}, "Refresh token actualizado", 200);
  } catch (error) {
    return manejarError(error, res);
  }
}

function logout(req, res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return enviarExito(res, "Logout exitoso");
}

module.exports = { login, refreshToken, logout };

