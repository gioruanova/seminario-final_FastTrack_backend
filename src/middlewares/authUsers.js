// -----------------
// Middleware unificado para usuarios
// Acepta superadmin, owner, operador y valida según rol
// -----------------
const jwt = require("jsonwebtoken");
const Company = require("../models/Company");
const User = require("../models/User");

function authUsers({ roles = [], skipCompanyCheck = false } = {}) {
  return async function (req, res, next) {
    // Log para diagnóstico en producción
    if (req.path.includes('/notifications')) {
      console.log("[authUsers] Request a /notifications:", {
        method: req.method,
        path: req.path,
        hasCookies: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
        hasAccessToken: !!req.cookies?.accessToken,
        headers: {
          'cookie': req.headers.cookie ? 'presente' : 'ausente',
          'authorization': req.headers.authorization ? 'presente' : 'ausente',
          'origin': req.headers.origin,
        },
        rolesRequired: roles,
      });
    }

    const token = req.cookies?.accessToken;
    if (!token) {
      if (req.path.includes('/notifications')) {
        console.error("[authUsers] Error: Token no provisto en cookies para /notifications");
      }
      return res.status(401).json({ error: "Token no provisto" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;

      if (req.path.includes('/notifications')) {
        console.log("[authUsers] Token decodificado:", {
          userId: decoded.user_id,
          userRole: decoded.user_role,
          rolesRequired: roles,
          roleMatch: roles.length ? roles.includes(decoded.user_role) : 'N/A',
        });
      }

      if (roles.length && !roles.includes(req.user.user_role)) {
        if (req.path.includes('/notifications')) {
          console.error("[authUsers] Error: Rol no autorizado. Rol:", req.user.user_role, "Requerido:", roles);
        }
        return res.status(403).json({ error: "No autorizado" });
      }

      if (req.user.user_role === "superadmin") {
        return next();
      }

      const { company_id, user_id } = req.user;

      if (!skipCompanyCheck && company_id) {
        const company = await Company.query().findById(company_id);
        if (!company || company.company_estado !== 1) {
          return res.status(403).json({
            error: "Contacte al administrador del sistema por favor.",
          });
        }
      }

      const user = await User.query().findById(user_id);
      if (!user || user.user_status !== 1) {
        const message =
          user?.user_role === "owner"
            ? "Contacte al administrador del sistema por favor."
            : "Contacte a su empresa por favor.";
        return res.status(403).json({ error: message });
      }

      next();
    } catch (error) {
      if (req.path.includes('/notifications')) {
        console.error("[authUsers] Error al verificar token:", {
          message: error.message,
          name: error.name,
        });
      }
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
}

module.exports = authUsers;

