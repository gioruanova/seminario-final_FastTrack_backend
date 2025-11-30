const Company = require("../../models/Company");
const { obtenerPorId, verificarDuplicado } = require("../../helpers/registroHelpers");
const { filtrarCamposPermitidos } = require("../../helpers/validationHelpers");

async function getCompanyInfo(companyId) {
  const company = await obtenerPorId(Company, companyId);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }
  return company;
}

async function updateCompany(companyId, data) {
  const allowedFields = [
    "company_phone",
    "company_email",
    "company_whatsapp",
    "company_telegram",
  ];

  const company = await obtenerPorId(Company, companyId);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }

  const {
    data: patchData,
    hasEmpty,
    empty: camposVacios,
  } = filtrarCamposPermitidos(data, allowedFields, true);

  if (hasEmpty) {
    throw new Error(`El campo ${camposVacios.join(", ")} no puede estar vacío`);
  }

  if (Object.keys(patchData).length === 0) {
    throw new Error("No se proporcionaron campos para actualizar");
  }

  if (patchData.company_email) {
    const existe = await verificarDuplicado(
      Company,
      { company_email: patchData.company_email },
      companyId
    );
    if (existe) {
      throw new Error("El email ya está registrado");
    }
  }

  await Company.query().patchAndFetchById(companyId, patchData);
  return true;
}

module.exports = { getCompanyInfo, updateCompany, };
