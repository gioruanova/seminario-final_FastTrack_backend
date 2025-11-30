const ReclamoService = require("./ReclamoService");

async function getReclamos() {
  return await ReclamoService.fetchReclamosByCompanyId(null, null);
}

async function getReclamosByCompany(companyId) {
  return await ReclamoService.fetchReclamosByCompanyId(companyId, null);
}

module.exports = { getReclamos, getReclamosByCompany };

