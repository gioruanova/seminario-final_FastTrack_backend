const CompaniesConfig = require("../models/CompaniesConfig");
const { registrarNuevoLog } = require("../controllers/globalLogController");

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Set configuración de empresa
// ---------------------------------------------------------
async function createCompanyConfigAsAdmin(data) {
  try {
    const companyConfig = await CompaniesConfig.query().insert(data);
    return companyConfig;
  } catch (error) {
    throw error;
  }
}

// CONTROLADORES PARA CLIENT:
// ---------------------------------------------------------
// Get configuración de empresa para Owner
// ---------------------------------------------------------
async function getCompanySettingsByClientForOwner(req, res) {
  const company_id = req.user.company_id;

  try {
    // const companyConfig = await CompaniesConfig.query()
    //   .findOne({ company_id })
    // .withGraphFetched("company");
    const companyConfig = await fetchCompanySettingsByCompanyId(company_id);

    if (!companyConfig) {
      return res
        .status(404)
        .json({ error: "Configuración de empresa no encontrada" });
    }

    return res.json(companyConfig);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------

// Get configuración de empresa
// ---------------------------------------------------------
async function getCompanySettingsByClient(req, res) {
  const company_id = req.user.company_id;

  try {
    // const companyConfig = await CompaniesConfig.query().findOne({ company_id });
    const companyConfig = await fetchCompanySettingsByCompanyId(company_id);

    if (!companyConfig) {
      return res
        .status(404)
        .json({ error: "Configuración de empresa no encontrada" });
    }

    return res.json(companyConfig);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

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
        return res
          .status(400)
          .json({ error: `Se han recibido campos vacios. Revalidar` });
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

  const otherFields = ["requiere_domicilio", "requiere_url"];

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
      return res.status(404).json({ error: "Configuración no encontrada." });
    }

    const updatedConfig = await CompaniesConfig.query().findOne({ company_id });

    /*LOGGER*/ await registrarNuevoLog(
      company_id,
      "La empresa " +
        req.user.company_name +
        " ha editado con éxito la configuracion inicial del sistema. " +
        ` (Ejecutado por ${req.user.user_name}).`
    );

    res
      .status(200)
      .json({ success: true, message: "Configuración actualizada." });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
// Metodo reutilizable para obtener
async function fetchCompanySettingsByCompanyId(company_id) {
  return CompaniesConfig.query()
    .findOne({ company_id })
    .withGraphFetched("company");
}

// metodo para pluralizar
// TODO: Revisar bien esto y hacer muchos experimentos
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
