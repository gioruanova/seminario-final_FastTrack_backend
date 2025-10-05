const { loginUser, refreshUserToken } = require("../services/authUserService");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y password son requeridos" });

    const result = await loginUser(email, password);
    if (!result)
      return res.status(401).json({ error: "Credenciales inválidas" });

    if (result.error === "blocked") {
      return res.status(403).json({ error: "Contacte a su administrador" });
    }
    // ✅ Enviar tokens en cookies HTTP-only
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // ✅ Devolver solo la info pública
    return res.json({
      company_name: result.company_name,
      company_id: result.company_id,
      company_status: result.company_status,
      user_name: result.user_name,
      user_role: result.user_role,
      user_email: result.user_email,
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

    // ✅ Extraemos solo el accessToken del objeto
    const tokenObject = refreshUserToken(tokenFromCookie); // devuelve { accessToken, refreshToken }
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

module.exports = { login, refreshToken };
