// -----------------
// CONTROLADOR DE CONFIGURACIÓN DE EMPRESA
// -----------------
const CompaniesConfig = require("../models/CompaniesConfig");
const { enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida } = require("../helpers/responseHelpers");

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// CREAR CONFIGURACIÓN DE EMPRESA
// -----------------
async function createCompanyConfigAsAdmin(data) {
  try {
    const companyConfig = await CompaniesConfig.query().insert(data);
    return companyConfig;
  } catch (error) {
    throw error;
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES):
// -----------------

// -----------------
// OBTENER CONFIGURACIÓN DE EMPRESA PARA OWNER
// -----------------
async function getCompanySettingsByClientForOwner(req, res) {
  const company_id = req.user.company_id;

  try {
    const companyConfig = await fetchCompanySettingsByCompanyId(company_id);

    if (!companyConfig) {
      return enviarNoEncontrado(res, "Configuración de empresa");
    }

    return res.json(companyConfig);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER CONFIGURACIÓN DE EMPRESA
// -----------------
async function getCompanySettingsByClient(req, res) {
  const company_id = req.user.company_id;

  try {
    const companyConfig = await fetchCompanySettingsByCompanyId(company_id);

    if (!companyConfig) {
      return enviarNoEncontrado(res, "Configuración de empresa");
    }

    return res.json(companyConfig);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR CONFIGURACIÓN DE EMPRESA
// -----------------
async function updateCompanySettingsByClient(req, res) {
  const company_id = req.user.company_id;
  const data = { ...req.body };

  const palabrasAPluralizar = [
    "sing_heading_owner",
    "sing_heading_profesional",
    "sing_heading_operador",
    "sing_heading_solicitante",
    "sing_heading_reclamos",
    "sing_heading_especialidad",
  ];

  const requiredNonEmptyFields = [
    ...palabrasAPluralizar,
    "string_inicio_reclamo_solicitante",
    "string_recordatorio_reclamo_solicitante",
    "string_cierre_reclamo_solicitante",
    "string_inicio_reclamo_profesional",
    "string_recordatorio_reclamo_profesional",
    "string_cierre_reclamo_profesional",
  ];

  const updateData = {};

  for (const field of requiredNonEmptyFields) {
    if (field in data) {
      if (typeof data[field] === "string" && data[field].trim() === "") {
        return enviarSolicitudInvalida(res, "Se han recibido campos vacios. Revalidar");
      }
    }
  }

  palabrasAPluralizar.forEach((field) => {
    if (field in data) {
      updateData[field] = data[field];
      const pluralField = field.replace("sing_", "plu_");
      updateData[pluralField] = convertirAPlural(data[field]);
    }
  });

  const otherFields = [
    "requiere_domicilio",
    "requiere_url",
    "requiere_fecha_final",
  ];

  otherFields.forEach((field) => {
    if (field in data) {
      updateData[field] = data[field];
    }
  });

  try {
    const updatedCount = await CompaniesConfig.query()
      .patch(updateData)
      .where("company_id", company_id);

    if (updatedCount === 0) {
      return enviarNoEncontrado(res, "Configuración");
    }

    const updatedConfig = await CompaniesConfig.query().findOne({ company_id });


    return enviarExito(res, "Configuración actualizada.");
  } catch (error) {
    return enviarError(res, "Error interno del servidor.", 500);
  }
}

// -----------------
// HELPERS
// -----------------

// -----------------
// OBTENER CONFIGURACIÓN DE EMPRESA POR ID
// -----------------
async function fetchCompanySettingsByCompanyId(company_id) {
  return CompaniesConfig.query()
    .findOne({ company_id })
    .withGraphFetched("company");
}

// -----------------
// CONVERTIR PALABRA A PLURAL
// -----------------
function convertirAPlural(word) {
  if (!word || typeof word !== "string") return word;
  const lower = word.toLowerCase();

  if (lower.endsWith("z")) return word.slice(0, -1) + "ces";
  if (lower.endsWith("ción")) return word.slice(0, -4) + "ciones";
  if (lower.endsWith("s") || lower.endsWith("x")) return word; // ya plural
  if (/[aeiouáéíóú]$/.test(lower)) return word + "s";
  return word + "es";
}

module.exports = {
  createCompanyConfigAsAdmin,

  getCompanySettingsByClient,
  getCompanySettingsByClientForOwner,
  updateCompanySettingsByClient,

  // helpers
  fetchCompanySettingsByCompanyId,
};
