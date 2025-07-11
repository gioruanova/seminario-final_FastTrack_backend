const Company = require("../models/Company");

async function getAllCompanies(req, res) {
  try {
    const companies = await Company.query();
    return res.json(companies);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getCompanyById(req, res) {
  try {
    const { company_id } = req.params;
    const company = await Company.query().findById(company_id);

    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    return res.status(200).json(company);
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function updateCompany(req, res) {
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

    return res.json(updatedCompany);
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

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
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const existing = await Company.query().findOne({ company_unique_id });
    if (existing) {
      return res.status(409).json({ error: "El company_unique_id ya existe" });
    }

    const newCompany = await Company.query().insert({
      company_unique_id,
      company_nombre,
      company_phone,
      company_email,
      limite_operadores,
      limite_profesionales,
      reminder_manual: false, // funcionalidad a evaluar si se cobra o no
      company_estado: false, // inactiva por defecto
    });

    return res
      .status(201)
      .json({ success: true, message: "Empresa creada exitosamente" });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  updateCompany,
  createCompany,
};
