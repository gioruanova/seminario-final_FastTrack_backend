const Company = require("../models/Company");
const companyConfigController = require("./companyConfigController");

const { registrarNuevoLog } = require("../controllers/globalLogController");

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Get all companies
// ---------------------------------------------------------
async function getAllCompanies(req, res) {
  try {
    const companies = await Company.query()
      .withGraphJoined("users")
      .withGraphFetched("users.especialidades.Especialidad");
    return res.json(companies);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Get company by id
// ---------------------------------------------------------
async function getCompanyById(req, res) {
  try {
    const { company_id } = req.params;
    const company = await Company.query()
      .findById(company_id)
      .withGraphFetched("users");

    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    return res.status(200).json(company);
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Update Company
// ---------------------------------------------------------
async function updateCompanyAsAdmin(req, res) {
  try {
    const { company_id } = req.params;
    const updateData = req.body;

    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const updatedCompany = await Company.query().patchAndFetchById(
      company_id,
      updateData
    );


    /*LOGGER*/ await registrarNuevoLog(
      company.company_id,
      "La empresa " +
        company.company_nombre +
        " se ha editado con exito. " +
        " (Ejecutado por Sistema)."
    );

    return res.json(updatedCompany);
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Create Company
// ---------------------------------------------------------
async function createCompany(req, res) {
  try {
    const {
      company_unique_id,
      company_nombre,
      company_phone,
      company_email,
      limite_operadores,
      limite_profesionales,
      reminder_manual,
    } = req.body;

    if (
      !company_unique_id ||
      !company_nombre ||
      !company_phone ||
      !company_email ||
      limite_operadores === undefined ||
      limite_profesionales === undefined ||
      reminder_manual === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Todos los campos son requeridos" });
    }

    const existingById = await Company.query().findOne({ company_unique_id });
    if (existingById) {
      return res
        .status(409)
        .json({ success: false, error: "El company_unique_id ya existe" });
    }

    const existingByEmail = await Company.query().findOne({ company_email });
    if (existingByEmail) {
      return res
        .status(409)
        .json({ success: false, error: "El email ya está registrado" });
    }

    const newCompany = await Company.query().insert({
      company_unique_id,
      company_nombre,
      company_phone,
      company_email,
      limite_operadores: 3,
      limite_especialidades: 10,
      limite_profesionales: 10,
      reminder_manual: false, // funcionalidad a evaluar si se cobra o no
      company_estado: false, // inactiva por defecto
    });

    const newConfigData = {
      company_id: newCompany.company_id,
    };

    await companyConfigController.createCompanyConfigAsAdmin(newConfigData);

    /*LOGGER*/ await registrarNuevoLog(
      newCompany.company_id,
      "La empresa " +
        newCompany.company_nombre +
        " se ha creado con exito. " +
        " (Ejecutado por Sistema)."
    );

    return res
      .status(201)
      .json({ success: true, message: "Empresa creada exitosamente" });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// CONTROLADORES PARA CLIENT:
// ---------------------------------------------------------
// Get company info
// ---------------------------------------------------------
async function getCompanyInfoAsClientForOnwer(req, res) {
  try {
    const company_id = req.user.company_id;
    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }
    return res.json(company);
  } catch (error) {
    console.error("Error al obtener información de empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Update Company
// ---------------------------------------------------------
async function updateCompanyAsClient(req, res) {
  try {
    const company_id = req.user.company_id;
    const allowedFields = [
      "company_phone",
      "company_email",
      "company_whatsapp",
      "company_telegram",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        const value = req.body[field];

        if (value === null || value === undefined || value === "") {
          return res.status(400).json({
            error: `El campo ${field} no puede estar vacío`,
          });
        }

        updateData[field] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No se proporcionó ningún campo válido para actualizar",
      });
    }

    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const updatedCompany = await Company.query().patchAndFetchById(
      company_id,
      updateData
    );

    /*LOGGER*/ await registrarNuevoLog(
      updatedCompany.company_id,
      "La empresa " +
        updatedCompany.company_nombre +
        " se ha editado con éxito. " +
        ` (Ejecutado por ${req.user.user_name}).`
    );

    return res.json({
      success: true,
      message: "Empresa actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
async function getLimitOperator(company_id) {
  try {
    const company = await Company.query().findById(company_id);
    return company?.limite_operadores || 0;
  } catch (error) {
    console.error("Error al obtener el límite de operadores:", error);
    throw error;
  }
}

async function getLimitProfesionales(company_id) {
  try {
    const company = await Company.query().findById(company_id);
    return company?.limite_profesionales || 0;
  } catch (error) {
    console.error("Error al obtener el límite de profesionales:", error);
    throw error;
  }
}

async function getLimitEspecialidades(company_id) {
  try {
    const company = await Company.query().findById(company_id);
    return company?.limite_especialidades || 0;
  } catch (error) {
    console.error("Error al obtener el límite de especialidades:", error);
    throw error;
  }
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  updateCompanyAsAdmin,
  createCompany,

  getCompanyInfoAsClientForOnwer,
  updateCompanyAsClient,

  // Helpers
  getLimitProfesionales,
  getLimitOperator,
  getLimitEspecialidades,
};
