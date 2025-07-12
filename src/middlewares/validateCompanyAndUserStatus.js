const Company = require("../models/Company");
const User = require("../models/User");

async function validateCompanyAndUserStatus(req, res, next) {
  try {
    const { company_id, user_id } = req.user;

    // Verificar estado de la empresa
    const company = await Company.query().findById(company_id);
    if (!company || company.company_estado !== 1) {
      return res
        .status(403)
        .json({ error: "Contacte al administrador del sistema por favor." });
    }

    // Verificar estado del usuario
    const user = await User.query().findById(user_id);
    if (!user || user.user_status !== 1) {
      if (user.user_role == "owner") {
        return res
          .status(403)
          .json({ error: "Contacte al administrador del sistema por favor." });
      } else {
        return res
          .status(403)
          .json({ error: "Contacte a su empresa por favor." });
      }
    }

    // Todo OK, continuar
    next();
  } catch (error) {
    console.error("Error en validación de empresa y usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = validateCompanyAndUserStatus;
