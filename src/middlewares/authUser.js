const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = process.env;

function authUser(...allowedRoles) {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no provisto" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ error: "No autorizado para este recurso" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
}

module.exports = authUser;
