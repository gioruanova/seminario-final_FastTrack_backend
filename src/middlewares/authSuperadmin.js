const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = process.env;

function authSuperadmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no provisto" });
    // TODO: Reemplazar esto por algo mas generico
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ error: "No autorizado" });
      // TODO: Reemplazar esto por algo mas generico
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
    // TODO: Reemplazar esto por algo mas generico
  }
}

module.exports = authSuperadmin;
