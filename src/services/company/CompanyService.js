const Company = require("../../models/Company");

async function getLimitOperadores(companyId) {
  const company = await Company.query().findById(companyId);
  return company?.limite_operadores || 0;
}

async function getLimitProfesionales(companyId) {
  const company = await Company.query().findById(companyId);
  return company?.limite_profesionales || 0;
}

async function getLimitEspecialidades(companyId) {
  const company = await Company.query().findById(companyId);
  return company?.limite_especialidades || 0;
}

module.exports = { getLimitOperadores, getLimitProfesionales, getLimitEspecialidades, };

