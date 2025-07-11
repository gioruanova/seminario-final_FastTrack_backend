const EspecialidadCreada = require("../models/EspecialidadCreada");

async function createEspecialidad(req, res) {
  try {
    const { nombre_especialidad } = req.body;

    const comp_id = req.user?.company_id;

    if (!nombre_especialidad) {
      return res
        .status(400)
        .json({ error: "nombre_especialidad son requeridos" });
    }

    const existing = await EspecialidadCreada.query()
      .where({ company_id: comp_id, nombre_especialidad })
      .first();

    if (existing) {
      return res
        .status(409)
        .json({ error: "La especialidad ya existe para esta empresa" });
    }

    const nuevaEspecialidad = await EspecialidadCreada.query().insert({
      company_id: comp_id,
      nombre_especialidad,
    });

    return res.status(201).json({success: true, message: "Especialidad creada correctamente"});
  } catch (error) {
    console.error("Error creando especialidad:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function updateEspecialidad(req, res) {
  try {
    const { especialidadId } = req.params;
    const { nombre_especialidad } = req.body;
    const company_id = req.user?.company_id;

    if (!nombre_especialidad) {
      return res
        .status(400)
        .json({ error: "El campo nombre_especialidad es requerido" });
    }

    const especialidad = await EspecialidadCreada.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidad) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    const existente = await EspecialidadCreada.query()
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

    const actualizada = await EspecialidadCreada.query().patchAndFetchById(
      especialidadId,
      {
        nombre_especialidad,
      }
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "Especialidad actualizada correctamente",
      });
  } catch (error) {
    console.error("Error actualizando especialidad:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  createEspecialidad,
  updateEspecialidad,
};
