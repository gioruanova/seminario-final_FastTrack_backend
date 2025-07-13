const Especialidad = require("../models/Especialidad");
const ProfesionalesEspecialidad = require("../models/ProfesionalesEspecialidad");
const Company = require("../models/Company");
const companyController = require("./companyController");

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Crear especialidad
// ---------------------------------------------------------
async function createEspecialidadAsAdmin(req, res) {
  try {
    const { company_id, nombre_especialidad } = req.body;

    if (!nombre_especialidad || !company_id) {
      return res
        .status(400)
        .json({ error: "nombre_especialidad y company_id son requeridos" });
    }

    const companyExist = await Company.query().findById(company_id);

    if (!companyExist) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const existing = await Especialidad.query()
      .where({ company_id: company_id, nombre_especialidad })
      .first();

    if (existing) {
      return res
        .status(409)
        .json({ error: "La especialidad ya existe para esta empresa" });
    }

    await Especialidad.query().insert({
      company_id,
      nombre_especialidad,
    });

    return res
      .status(201)
      .json({ success: true, message: "Especialidad creada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Update especialidad
// ---------------------------------------------------------
async function updateEspecialidadAsAdmin(req, res) {
  try {
    const { especialidadId } = req.params;
    const { nombre_especialidad } = req.body;

    if (!nombre_especialidad || !especialidadId) {
      return res
        .status(400)
        .json({ error: "El campo nombre_especialidad es requerido" });
    }

    const especialidadExiste = await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .first();

    if (!especialidadExiste) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    } else {
      await Especialidad.query()
        .where({ id_especialidad: especialidadId })
        .update({
          nombre_especialidad: nombre_especialidad,
          company_id: especialidadExiste.company_id,
        });
    }

    return res.status(200).json({
      success: true,
      message: "Especialidad actualizada correctamente",
    });
  } catch (error) {
    console.error("Error actualizando especialidad:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Get all especialidades
// ---------------------------------------------------------
async function getAllEspecialidadesAsAdmin(req, res) {
  try {
    
    const especialidades = await Especialidad.query().select("*");
    return res.json(especialidades);
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Get all especialidades by company
// ---------------------------------------------------------
async function getAllEspecialidadesByCompanyAsAdmin(req, res) {
  try {
    const {company_id}  = req.params;
    
    const especialidades = await Especialidad.query().where({company_id}).select("*");
    return res.json(especialidades);
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}




// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================

// CONTROLADORES PARA USER:
// ---------------------------------------------------------
// Crear especialidad
// ---------------------------------------------------------
async function createEspecialidadAsClient(req, res) {
  let limiteEspecialidades;
  let currentTotalEspecialidades;
  try {
    const { nombre_especialidad } = req.body;

    const comp_id = req.user?.company_id;

    if (!nombre_especialidad) {
      return res
        .status(400)
        .json({ error: "nombre_especialidad son requeridos" });
    }

    const existing = await Especialidad.query()
      .where({ company_id: comp_id, nombre_especialidad })
      .first();

    if (existing) {
      return res
        .status(409)
        .json({ error: "La especialidad ya existe para esta empresa" });
    }

    limiteEspecialidades = await companyController.getLimitEspecialidades(
      comp_id
    );

    currentTotalEspecialidades = await getCurrentTotalEspecialidades(comp_id);

    if (currentTotalEspecialidades >= limiteEspecialidades) {
      return res
        .status(400)
        .json({ error: "Has alcanzado el limite de especialidades" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Especialidad creada correctamente" });
  } catch (error) {
    console.error("Error creando especialidad:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function updateEspecialidadAsClient(req, res) {
  try {
    const { especialidadId } = req.params;
    const { nombre_especialidad } = req.body;
    const company_id = req.user?.company_id;

    if (!nombre_especialidad) {
      return res
        .status(400)
        .json({ error: "El campo nombre_especialidad es requerido" });
    }

    const especialidad = await Especialidad.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidad) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    const existente = await Especialidad.query()
      .where({
        company_id,
        nombre_especialidad,
      })
      .whereNot("id_especialidad", especialidadId)
      .first();

    if (existente) {
      return res
        .status(409)
        .json({ error: "Ya existe una especialidad con ese nombre" });
    }

    const actualizada = await Especialidad.query().patchAndFetchById(
      especialidadId,
      {
        nombre_especialidad,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Especialidad actualizada correctamente",
    });
  } catch (error) {
    console.error("Error actualizando especialidad:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getAllEspecialidades(req, res) {
  try {
    const company_id = req.user?.company_id;
    const especialidades = await Especialidad.query().where({ company_id });
    return res.json(especialidades);
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function validarEspecialidad(id_especialidad, company_id) {
  const especialidad = await Especialidad.query().findOne({
    id_especialidad,
    company_id,
  });
  if (!especialidad) {
    return false;
  }
  return true;
}

async function addNewEspecialidadProfesional(
  id_usuario,
  id_especialidad_creada,
  company_id
) {
  return await ProfesionalesEspecialidad.query().insert({
    id_usuario,
    id_especialidad_creada,
    company_id,
  });
}

async function eliminarEspecialidadesPorUsuario(id_usuario) {
  await ProfesionalesEspecialidad.query()
    .delete()
    .where("id_usuario", id_usuario);
}

// Obtener total de operadores actual por empresa
async function getCurrentTotalEspecialidades(company_id) {
  const result = await Especialidad.query()
    .where({ company_id })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

module.exports = {
  createEspecialidadAsAdmin,
  updateEspecialidadAsAdmin,
  getAllEspecialidadesAsAdmin,
  getAllEspecialidadesByCompanyAsAdmin,

  createEspecialidadAsClient,
  updateEspecialidadAsClient,

  getAllEspecialidades,
  validarEspecialidad,
  addNewEspecialidadProfesional,
  eliminarEspecialidadesPorUsuario,
};
