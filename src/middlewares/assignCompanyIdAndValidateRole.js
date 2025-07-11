function assignCompanyIdAndValidateRole(req, res, next) {
  const allowedRoles = ["profesional", "operador"];

  const companyIdFromToken = req.user?.company_id;
  if (!companyIdFromToken) {
    return res.status(401).json({ error: "Token inválido o sin company_id" });
  }

  req.body.company_id = companyIdFromToken;

  const { user_role } = req.body;
  if (!allowedRoles.includes(user_role)) {
    return res.status(400).json({ error: "Rol no permitido" });
  }

  next();
}


module.exports = assignCompanyIdAndValidateRole;