const CompaniesConfig = require("../models/CompaniesConfig");

async function createCompanyConfigAsAdmin(data) {
  try {
    const companyConfig = await CompaniesConfig.query().insert(data);
    return companyConfig;
  } catch (error) {
    console.error("Error al crear configuración de empresa:", error);
  }
}

module.exports = {
  createCompanyConfigAsAdmin,
};
