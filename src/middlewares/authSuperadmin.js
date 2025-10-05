const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = process.env;

function authSuperadmin(req, res, next) {
  // ✅ Leer accessToken desde cookie
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Token no provisto" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (decoded.user_role !== "superadmin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = authSuperadmin;
