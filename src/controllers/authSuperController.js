const { loginAdmin, refreshAdminToken } = require("../services/authSuperService");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y password son requeridos" });

    const tokens = await loginAdmin(email, password);
    if (!tokens)
      return res.status(401).json({ error: "Credenciales inválidas" });

    return res.json({
      email: email, 
      name: tokens.name,
      role: "superadmin",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error("Error login superadmin:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Refresh token es requerido" });

    const newAccessToken = refreshAdminToken(refreshToken);
    if (!newAccessToken)
      return res.status(401).json({ error: "Refresh token inválido o expirado" });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refresh superadmin token:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  login,
  refreshToken,
};
