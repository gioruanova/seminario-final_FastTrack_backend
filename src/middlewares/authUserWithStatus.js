const jwt = require("jsonwebtoken");
const Company = require("../models/Company");
const User = require("../models/User");

function authUserWithStatus(...allowedRoles) {
  return async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no provisto" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      const expTimestamp = decoded.exp;

      // Convertimos a milisegundos y creamos un objeto Date
      const expDate = new Date(expTimestamp * 1000);

      console.log(expDate.toString()); // Ej: "Thu Aug 21 2025 14:30:00 GMT-0300 (Argentina Standard Time)"
      console.log(expDate.toISOString()); // Ej: "2025-08-21T17:30:00.000Z"

      // valido roles para ver si pueden acceder o no
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(req.user.user_role)
      ) {
        return res
          .status(403)
          .json({ error: "No autorizado para este recurso" });
      }

      const { company_id, user_id } = req.user;

      // check del estado de la empresa
      const company = await Company.query().findById(company_id);
      if (!company || company.company_estado !== 1) {
        return res
          .status(403)
          .json({ error: "Contacte al administrador del sistema por favor." });
      }

      // valido estado del user (revisar relaciones para no borrar fisicamente y romper relaciones > ver en reclamos como se comporta esto)
      const user = await User.query().findById(user_id);
      if (!user || user.user_status !== 1) {
        const message =
          user?.user_role === "owner"
            ? "Contacte al administrador del sistema por favor."
            : "Contacte a su empresa por favor.";
        return res.status(403).json({ error: message });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
}

module.exports = authUserWithStatus;
