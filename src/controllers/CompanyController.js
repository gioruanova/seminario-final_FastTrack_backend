const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, enviarNoEncontrado, enviarConflicto, enviarSinPermiso } = require("../helpers/responseHelpers");
const CompanyAdminService = require("../services/company/CompanyAdminService");
const CompanyOwnerService = require("../services/company/CompanyOwnerService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "No existe empresa bajo ese ID": () => enviarNoEncontrado(res, "Empresa"),
    "El email ya está registrado": () => enviarConflicto(res, error.message),
    "El company_unique_id ya existe": () => enviarConflicto(res, error.message),
    "No se proporcionaron campos para actualizar": () => enviarSolicitudInvalida(res, error.message),
    "El campo no puede estar vacío": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

async function getCompanies(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await getCompaniesAsAdmin(req, res);
      case "owner":
        return await getCompanyInfoAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getCompanyById(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await getCompanyByIdAsAdmin(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createCompany(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await createCompanyAsAdmin(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para crear empresas");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateCompany(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await updateCompanyAsAdmin(req, res);
      case "owner":
        return await updateCompanyAsOwner(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para actualizar empresas");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getCompaniesAsAdmin(req, res) {
  const companies = await CompanyAdminService.getAllCompanies();
  return enviarLista(res, companies);
}

async function getCompanyByIdAsAdmin(req, res) {
  const { company_id } = req.params;
  const company = await CompanyAdminService.getCompanyById(company_id);
  return enviarLista(res, company);
}

async function createCompanyAsAdmin(req, res) {
  await CompanyAdminService.createCompany(req.body);
  return enviarExito(res, "Empresa creada exitosamente", 201);
}

async function updateCompanyAsAdmin(req, res) {
  const { company_id } = req.params;
  await CompanyAdminService.updateCompany(company_id, req.body);
  return enviarExito(res, "Empresa actualizada exitosamente");
}

async function getCompanyInfoAsOwner(req, res) {
  const companyId = req.user.company_id;
  const company = await CompanyOwnerService.getCompanyInfo(companyId);
  return enviarLista(res, company);
}

async function updateCompanyAsOwner(req, res) {
  const companyId = req.user.company_id;
  await CompanyOwnerService.updateCompany(companyId, req.body);
  return enviarExito(res, "Empresa actualizada exitosamente");
}

module.exports = { getCompanies, getCompanyById, createCompany, updateCompany };

