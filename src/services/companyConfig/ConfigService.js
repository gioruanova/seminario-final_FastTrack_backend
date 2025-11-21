const CompaniesConfig = require("../../models/CompaniesConfig");

async function createCompanyConfig(companyId) {
  const companyConfig = await CompaniesConfig.query().insert({
    company_id: companyId,
  });
  return companyConfig;
}

async function getCompanyConfig(companyId) {
  const config = await CompaniesConfig.query()
    .findOne({ company_id: companyId })
    .withGraphFetched("company");

  if (!config) {
    throw new Error("No existe configuración para esta empresa");
  }

  return config;
}

async function updateCompanyConfig(companyId, data) {
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
        throw new Error("Se han recibido campos vacíos. Revalidar");
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
      const value = data[field];
      let booleanValue;

      if (typeof value === "boolean") {
        booleanValue = value;
      } else if (typeof value === "number") {
        booleanValue = value === 1;
      } else if (typeof value === "string") {
        booleanValue = value.toLowerCase() === "true" || value === "1";
      } else {
        booleanValue = Boolean(value);
      }

      updateData[field] = booleanValue;
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new Error("No se proporcionaron campos para actualizar");
  }

  const updatedCount = await CompaniesConfig.query()
    .patch(updateData)
    .where("company_id", companyId);

  if (updatedCount === 0) {
    throw new Error("No existe configuración para esta empresa");
  }

  return true;
}

function convertirAPlural(word) {
  if (!word || typeof word !== "string") return word;
  const lower = word.toLowerCase();

  if (lower.endsWith("z")) return word.slice(0, -1) + "ces";
  if (lower.endsWith("ción")) return word.slice(0, -4) + "ciones";
  if (lower.endsWith("s") || lower.endsWith("x")) return word;
  if (/[aeiouáéíóú]$/.test(lower)) return word + "s";
  return word + "es";
}

module.exports = { createCompanyConfig, getCompanyConfig, updateCompanyConfig, };
