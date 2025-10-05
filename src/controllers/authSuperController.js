const {
  loginAdmin,
  refreshAdminToken,
} = require("../services/authSuperService");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y password son requeridos" });

    const tokens = await loginAdmin(email, password);
    if (!tokens)
      return res.status(401).json({ error: "Credenciales inválidas" });

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // solo https en producción
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Devuelves solo la info pública
    return res.json({
      user_email: email,
      user_name: tokens.user_name,
      user_role: "superadmin",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

function refreshToken(req, res) {
  try {
    const tokenFromCookie = req.cookies.refreshToken;

    if (!tokenFromCookie)
      return res.status(400).json({ error: "Refresh token es requerido" });

    // Extraemos solo el accessToken
    const tokenObject = refreshAdminToken(tokenFromCookie); // devuelve { accessToken, refreshToken }
    if (!tokenObject || !tokenObject.accessToken)
      return res
        .status(401)
        .json({ error: "Refresh token inválido o expirado" });

    const newAccessToken = tokenObject.accessToken;

    // Guardamos solo el JWT en la cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  login,
  refreshToken,
};
