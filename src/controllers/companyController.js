// -----------------
// CONTROLADOR DE EMPRESAS
// -----------------
const Company = require("../models/Company");
const companyConfigController = require("./companyConfigController");
const { registrarNuevoLog } = require("../controllers/globalLogController");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida } = require("../helpers/responseHelpers");
const { obtenerPorId } = require("../helpers/registroHelpers");
const { validarCamposObligatorios } = require("../helpers/validationHelpers");

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// OBTENER TODAS LAS EMPRESAS
// -----------------
async function getAllCompanies(req, res) {
  try {
    const companies = await Company.query()
      .withGraphJoined("users")
      .withGraphFetched("users.especialidades.Especialidad");

    return enviarLista(res, companies);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER EMPRESA POR ID
// -----------------
async function getCompanyById(req, res) {
  try {
    const { company_id } = req.params;
    const company = await Company.query()
      .findById(company_id)
      .withGraphFetched("users");

    if (!company) {
      return enviarNoEncontrado(res, "Empresa");
    }

    return res.status(200).json(company);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR EMPRESA
// -----------------
async function updateCompanyAsAdmin(req, res) {
  try {
    const { company_id } = req.params;
    const updateData = req.body;

    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      return enviarNoEncontrado(res, "Empresa");
    }

    await Company.query().patchAndFetchById(company_id, updateData);

    /*LOGGER*/ await registrarNuevoLog(
      company.company_id,
      "La empresa " +
      company.company_nombre +
      " se ha editado con exito. " +
      " (Ejecutado por Sistema)."
    );

    return enviarExito(res, "Empresa actualizada exitosamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CREAR EMPRESA
// -----------------
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

    const camposRequeridos = [
      "company_unique_id",
      "company_nombre",
      "company_phone",
      "company_email",
    ];

    const validacion = validarCamposObligatorios(req.body, camposRequeridos);
    if (!validacion.valid) {
      return res.status(400).json({ success: false, error: validacion.error });
    }

    if (
      limite_operadores === undefined ||
      limite_profesionales === undefined ||
      reminder_manual === undefined
    ) {
      return res.status(400).json({ success: false, error: "Todos los campos son requeridos" });
    }

    const existingById = await Company.query().findOne({ company_unique_id });
    if (existingById) {
      return res.status(409).json({ success: false, error: "El company_unique_id ya existe" });
    }

    const existingByEmail = await Company.query().findOne({ company_email });
    if (existingByEmail) {
      return res.status(409).json({ success: false, error: "El email ya está registrado" });
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

    return enviarExito(res, "Empresa creada exitosamente", 201);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES):
// -----------------

// -----------------
// OBTENER INFORMACIÓN DE EMPRESA
// -----------------
async function getCompanyInfoAsClientForOnwer(req, res) {
  try {
    const company_id = req.user.company_id;
    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      return enviarNoEncontrado(res, "Empresa");
    }
    return res.json(company);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR EMPRESA
// -----------------
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
          return enviarSolicitudInvalida(res, `El campo ${field} no puede estar vacío`);
        }

        updateData[field] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return enviarSolicitudInvalida(res, "No se proporcionó ningún campo válido para actualizar");
    }

    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      return enviarNoEncontrado(res, "Empresa");
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

    return enviarExito(res, "Empresa actualizada exitosamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// HELPERS
// -----------------

// -----------------
// OBTENER LÍMITE DE OPERADORES
// -----------------
async function getLimitOperator(company_id) {
  try {
    const company = await obtenerPorId(Company, company_id);
    return company?.limite_operadores || 0;
  } catch (error) {
    throw error;
  }
}

// -----------------
// OBTENER LÍMITE DE PROFESIONALES
// -----------------
async function getLimitProfesionales(company_id) {
  try {
    const company = await obtenerPorId(Company, company_id);
    return company?.limite_profesionales || 0;
  } catch (error) {
    throw error;
  }
}

// -----------------
// OBTENER LÍMITE DE ESPECIALIDADES
// -----------------
async function getLimitEspecialidades(company_id) {
  try {
    const company = await obtenerPorId(Company, company_id);
    return company?.limite_especialidades || 0;
  } catch (error) {
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
