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

    return res.json(result);
  } catch (error) {
    console.error("Error login user:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Refresh token es requerido" });

    const newAccessToken = refreshUserToken(refreshToken);
    if (!newAccessToken)
      return res
        .status(401)
        .json({ error: "Refresh token inválido o expirado" });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refresh user token:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { login, refreshToken };
