function checkCompanyAccess(req, res, next) {
  const companyIdFromToken = req.user?.company_id;
  const companyIdFromParams = Number(req.params.company_id);

  if (!companyIdFromToken) {
    return res.status(401).json({ error: "Token inválido o sin company_id" });
  }

  if (companyIdFromToken !== companyIdFromParams) {
    return res.status(403).json({ error: "No autorizado para esta empresa" });
  }

  

  next();
}

module.exports = checkCompanyAccess;
