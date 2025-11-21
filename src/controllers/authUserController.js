
const { enviarExito, enviarExitoConDatos, enviarError, enviarNoAutenticado, enviarSolicitudInvalida, enviarSinPermiso, } = require("../helpers/responseHelpers");
const { loginUser, refreshUserToken } = require("../services/auth/authUserService");
const ms = require("ms");

// -----------------
// LOGIN
// -----------------
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return enviarSolicitudInvalida(res, "Email y password son requeridos");

    const result = await loginUser(email, password);
    if (!result) return enviarNoAutenticado(res, "Credenciales inválidas");

    if (result.error === "blocked") {
      return enviarSinPermiso(res, "Contacte a su administrador");
    }

    // envioo tokens en cookies HTTP-only
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_EXPIRATION), // 30m
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_REFRESH_EXPIRATION), // 7d
    });

    // tomo  userData y devuelvo solo info pública
    const { accessToken, refreshToken, ...userData } = result;

    return enviarExitoConDatos(res, userData, "Login exitoso", 200);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// REFRESH TOKEN
// -----------------
function refreshToken(req, res) {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie)
      return enviarSolicitudInvalida(res, "Refresh token es requerido");

    const tokenObject = refreshUserToken(tokenFromCookie);
    if (!tokenObject || !tokenObject.accessToken)
      return enviarNoAutenticado(res, "Refresh token inválido o expirado");

    // actualizo cookie
    res.cookie("accessToken", tokenObject.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_EXPIRATION), // 30m
    });

    return enviarExitoConDatos(res, {}, "Refresh token actualizado", 200);
  } catch {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// LOGOUT
// -----------------
function logout(req, res) {
  // Borrar cookies HTTP-only
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
