const Company = require("../../models/Company");
const { obtenerPorId, verificarDuplicado } = require("../../helpers/registroHelpers");
const { validarCamposObligatorios } = require("../../helpers/validationHelpers");
const ConfigService = require("../companyConfig/ConfigService");

async function getAllCompanies() {
  const companies = await Company.query()
    .withGraphJoined("users")
    .withGraphFetched("users.especialidades.Especialidad");
  return companies;
}

async function getCompanyById(companyId) {
  const company = await Company.query()
    .findById(companyId)
    .withGraphFetched("users");

  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }

  return company;
}

async function createCompany(data) {
  const {
    company_unique_id,
    company_nombre,
    company_phone,
    company_email,
    limite_operadores,
    limite_profesionales,
    limite_especialidades,
    reminder_manual,
  } = data;

  const camposRequeridos = [
    "company_unique_id",
    "company_nombre",
    "company_phone",
    "company_email",
  ];

  const validacion = validarCamposObligatorios(data, camposRequeridos);
  if (!validacion.valid) {
    throw new Error(validacion.error);
  }

  const existingById = await Company.query().findOne({ company_unique_id });
  if (existingById) {
    throw new Error("El company_unique_id ya existe");
  }

  const existingByEmail = await Company.query().findOne({ company_email });
  if (existingByEmail) {
    throw new Error("El email ya está registrado");
  }

  const newCompany = await Company.query().insert({
    company_unique_id,
    company_nombre,
    company_phone,
    company_email,
    limite_operadores: limite_operadores || 3,
    limite_especialidades: limite_especialidades || 10,
    limite_profesionales: limite_profesionales || 10,
    reminder_manual: reminder_manual !== undefined ? reminder_manual : false,
    company_estado: false,
  });

  await ConfigService.createCompanyConfig(newCompany.company_id);

  return newCompany;
}

async function updateCompany(companyId, data) {
  const company = await obtenerPorId(Company, companyId);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }

  if (data.company_email) {
    const existe = await verificarDuplicado(
      Company,
      { company_email: data.company_email },
      companyId
    );
    if (existe) {
      throw new Error("El email ya está registrado");
    }
  }

  if (data.company_unique_id) {
    const existe = await verificarDuplicado(
      Company,
      { company_unique_id: data.company_unique_id },
      companyId
    );
    if (existe) {
      throw new Error("El company_unique_id ya existe");
    }
  }

  await Company.query().patchAndFetchById(companyId, data);
  return true;
}

module.exports = { getAllCompanies, getCompanyById, createCompany, updateCompany, };

