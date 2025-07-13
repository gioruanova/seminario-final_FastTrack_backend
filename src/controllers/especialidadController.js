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
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Get all especialidades by company
// ---------------------------------------------------------
async function getAllEspecialidadesByCompanyAsAdmin(req, res) {
  try {
    const { company_id } = req.params;

    const especialidades = await Especialidad.query()
      .where({ company_id })
      .select("*");
    return res.json(especialidades);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Disable Especialidad
// ---------------------------------------------------------
async function disableEspecialidadAsAdmin(req, res) {
  try {
    const { especialidadId } = req.params;

    if (!especialidadId) {
      return res
        .status(400)
        .json({ error: "El campo nombre_especialidad es requerido" });
    }

    const especialidadExiste = await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .first();

    if (!especialidadExiste) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (especialidadExiste.estado_especialidad === 0) {
      return res
        .status(400)
        .json({ error: "Especialidad ya esta desactivada" });
    }

    await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .update({
        estado_especialidad: false,
        nombre_especialidad: especialidadExiste.nombre_especialidad,
        company_id: especialidadExiste.company_id,
      });

    return res.status(200).json({
      success: true,
      message: "Especialidad desactivada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Enable Especialidad
// ---------------------------------------------------------
async function enableEspecialidadAsAdmin(req, res) {
  try {
    const { especialidadId } = req.params;

    if (!especialidadId) {
      return res
        .status(400)
        .json({ error: "El campo nombre_especialidad es requerido" });
    }

    const especialidadExiste = await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .first();

    if (!especialidadExiste) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (especialidadExiste.estado_especialidad === 1) {
      return res.status(400).json({ error: "Especialidad ya esta activada" });
    }

    await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .update({
        estado_especialidad: true,
        nombre_especialidad: especialidadExiste.nombre_especialidad,
        company_id: especialidadExiste.company_id,
      });

    return res.status(200).json({
      success: true,
      message: "Especialidad activada correctamente",
    });
  } catch (error) {
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
// Get all especialidades
// ---------------------------------------------------------
async function getAllEspecialidades(req, res) {
  try {
    const company_id = req.user?.company_id;
    const especialidades = await Especialidad.query().where({ company_id });
    return res.json(especialidades);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
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
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Update especialidad
// ---------------------------------------------------------
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

    await Especialidad.query().patchAndFetchById(especialidadId, {
      nombre_especialidad,
    });

    return res.status(200).json({
      success: true,
      message: "Especialidad actualizada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Disable espacialidad
// ---------------------------------------------------------
async function disableEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;

  try {
    const { especialidadId } = req.params;

    const especialidadToManage = await Especialidad.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidadToManage) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (especialidadToManage.estado_especialidad === 0) {
      return res
        .status(400)
        .json({ error: "Especialidad ya esta desactivada" });
    }

    await Especialidad.query().patchAndFetchById(especialidadId, {
      estado_especialidad: false,
      nombre_especialidad: especialidadToManage.nombre_especialidad,
      company_id: especialidadToManage.company_id,
    });

    return res.status(200).json({
      success: true,
      message: "Especialidad desactivada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Disable espacialidad
// ---------------------------------------------------------
async function enableEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;

  try {
    const { especialidadId } = req.params;

    const especialidadToManage = await Especialidad.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidadToManage) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (especialidadToManage.estado_especialidad === 1) {
      return res.status(400).json({ error: "Especialidad ya esta activada" });
    }

    await Especialidad.query().patchAndFetchById(especialidadId, {
      estado_especialidad: true,
      nombre_especialidad: especialidadToManage.nombre_especialidad,
      company_id: especialidadToManage.company_id,
    });

    return res.status(200).json({
      success: true,
      message: "Especialidad activada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ==========================================================
// HELPERS
// ==========================================================
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
  disableEspecialidadAsAdmin,
  enableEspecialidadAsAdmin,

  createEspecialidadAsClient,
  updateEspecialidadAsClient,
  disableEspecialidadAsClient,
  enableEspecialidadAsClient,

  getAllEspecialidades,
};
