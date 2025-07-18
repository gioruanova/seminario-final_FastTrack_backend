const ProfesionalEspecialidad = require("../models/ProfesionalesEspecialidad");

const Especialidad = require("../models/Especialidad");

const { registrarNuevoLog } = require("../controllers/globalLogController");
const User = require("../models/User");

const permitirAsignacionInactiva = false;

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Asignar especialidad a profesional
// ---------------------------------------------------------
async function assignEspecialidadAsAdmin(req, res) {
  try {
    const { profesional_id, especialidad_id } = req.body;

    if (!profesional_id || !especialidad_id) {
      return res
        .status(400)
        .json({ error: "El profesional y la especialidad son requeridos" });
    }

    const profesionalExiste = await User.query()
      .findById(profesional_id)
      .where("user_role", "profesional");

    if (!profesionalExiste) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    const especialidadExiste = await Especialidad.query()
      .findById(especialidad_id)
      .where("company_id", profesionalExiste.company_id);

    if (!especialidadExiste) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (
      !permitirAsignacionInactiva &&
      especialidadExiste.estado_especialidad === 0
    ) {
      return res.status(400).json({ error: "Especialidad inactiva" });
    }

    const asignacion = await ProfesionalEspecialidad.query()
      .where({ id_usuario: profesional_id, id_especialidad: especialidad_id })
      .first();

    if (asignacion) {
      return res
        .status(409)
        .json({ error: "La especialidad ya esta asignada al profesional" });
    }

    await ProfesionalEspecialidad.query().insert({
      id_usuario: profesional_id,
      company_id: profesionalExiste.company_id,
      id_especialidad: especialidad_id,
    });

    /*LOGGER*/ await registrarNuevoLog(
      profesionalExiste.company_id,
      "Se ha asignado la especialidad: " +
        especialidadExiste.nombre_especialidad +
        " al profesional: " +
        profesionalExiste.first_name +
        " " +
        profesionalExiste.last_name
    );
    return res
      .status(201)
      .json({ message: "Especialidad asignada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al asignar la especialidad" });
  }
}
// ---------------------------------------------------------
// Eliminar una especialidad de un profesional
// ---------------------------------------------------------
async function deleteEspecialidadAsAdmin(req, res) {
  try {
    const { id_asignacion } = req.params;

    if (!id_asignacion) {
      return res
        .status(400)
        .json({ error: "Es necesario el id de la asignacion" });
    }

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion })
      .first();

    if (!profesionalEspecialidadExiste) {
      return res.status(404).json({
        error: "Asignacion de Especialidad-Profesional no encontrada",
      });
    }

    await ProfesionalEspecialidad.query().where({ id_asignacion }).delete();

    /*LOGGER*/ await registrarNuevoLog(
      profesionalEspecialidadExiste.company_id,
      "Se ha eliminado la especialidad: " +
        profesionalEspecialidadExiste.id_especialidad +
        " del profesional: " +
        profesionalEspecialidadExiste.id_usuario
    );
    return res
      .status(201)
      .json({ message: "Especialidad eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar la especialidad" });
  }
}

// ---------------------------------------------------------
// Editar una asignacion
// ---------------------------------------------------------
async function editAsignacionEspecialidadAsAdmin(req, res) {
  try {
    const { id_asignacion } = req.params;
    const { especialidad_id } = req.body;

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion })
      .first();

    if (!profesionalEspecialidadExiste) {
      return res.status(404).json({
        error: "Asignacion de Especialidad-Profesional no encontrada",
      });
    }

    if (!especialidad_id) {
      return res
        .status(400)
        .json({ error: "Es necesario el id de la especialidad" });
    }

    const validacionEspecialidad = await Especialidad.query()
      .where({
        id_especialidad: especialidad_id,
        company_id: profesionalEspecialidadExiste.company_id,
      })
      .first();

    if (!validacionEspecialidad) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (
      !permitirAsignacionInactiva &&
      validacionEspecialidad.estado_especialidad === 0
    ) {
      return res.status(400).json({ error: "Especialidad inactiva" });
    }

    const validacionAsignacion = await ProfesionalEspecialidad.query()
      .where({
        id_especialidad: especialidad_id,
        id_usuario: profesionalEspecialidadExiste.id_usuario,
      })
      .first();

    if (validacionAsignacion) {
      return res
        .status(409)
        .json({ error: "La especialidad ya esta asignada al profesional" });
    }

    await ProfesionalEspecialidad.query()
      .where({ id_asignacion })
      .patch({ id_especialidad: especialidad_id });

    /*LOGGER*/ await registrarNuevoLog(
      profesionalEspecialidadExiste.company_id,
      "Se ha actualizado la especialidad: " +
        profesionalEspecialidadExiste.id_especialidad +
        " del profesional: " +
        profesionalEspecialidadExiste.id_usuario
    );
    return res
      .status(201)
      .json({ message: "Asignacion actualizada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al actualizar la asignacion" });
  }
}

// CONTROLADORES PARA CLIENT:
// ---------------------------------------------------------
// Asignar especialidad a profesional
// ---------------------------------------------------------
async function assignEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;
  try {
    const { profesional_id, especialidad_id } = req.body;

    if (!profesional_id || !especialidad_id) {
      return res.status(400).json({
        error: "Es necesario el id del profesional y la especialidad",
      });
    }

    const validacionEspecialidad = await Especialidad.query()
      .where({
        id_especialidad: especialidad_id,
        company_id,
      })
      .first();

    if (!validacionEspecialidad) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (
      !permitirAsignacionInactiva &&
      validacionEspecialidad.estado_especialidad === 0
    ) {
      return res.status(400).json({ error: "Especialidad inactiva" });
    }

    const validacionProfesional = await User.query()
      .where({
        user_id: profesional_id,
        user_role: "profesional",
        company_id,
      })
      .first();

    if (!validacionProfesional) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({
        id_especialidad: especialidad_id,
        id_usuario: profesional_id,
        company_id: company_id,
      })
      .first();

    if (profesionalEspecialidadExiste) {
      return res
        .status(409)
        .json({ error: "La especialidad ya esta asignada al profesional" });
    }

    await ProfesionalEspecialidad.query().insert({
      id_especialidad: especialidad_id,
      id_usuario: profesional_id,
      company_id,
    });

    /*LOGGER*/ await registrarNuevoLog(
      company_id,
      "Se ha asignado la especialidad: " +
        especialidad_id +
        " al profesional: " +
        profesional_id +
        ". (Ejecutado por " +
        req.user.user_name +
        ")."
    );
    return res
      .status(201)
      .json({ message: "Especialidad asignada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al asignar la especialidad" });
  }
}

// ---------------------------------------------------------
// Eliminar una especialidad de un profesional
// ---------------------------------------------------------
async function deleteEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;
  try {
    const { id_asignacion } = req.params;

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion, company_id })
      .first();

    if (!profesionalEspecialidadExiste) {
      return res.status(404).json({
        error: "Asignacion de Especialidad-Profesional no encontrada",
      });
    }

    await ProfesionalEspecialidad.query().where({ id_asignacion }).delete();

    /*LOGGER*/ await registrarNuevoLog(
      company_id,
      "Se ha eliminado la especialidad: " +
        profesionalEspecialidadExiste.id_especialidad +
        " del profesional: " +
        profesionalEspecialidadExiste.id_usuario +
        ". (Ejecutado por " +
        req.user.user_name +
        ")."
    );
    return res
      .status(201)
      .json({ message: "Asignacion eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar la asignacion" });
  }
}

// ---------------------------------------------------------
// Editar una asignacion
// ---------------------------------------------------------

async function editAsignacionEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;
  try {
    const { id_asignacion } = req.params;
    const { especialidad_id } = req.body;

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion, company_id })
      .first();

    if (!profesionalEspecialidadExiste) {
      return res.status(404).json({
        error: "Asignacion de Especialidad-Profesional no encontrada",
      });
    }

    const validacionEspecialidad = await Especialidad.query()
      .where({
        id_especialidad: especialidad_id,
        company_id,
      })
      .first();

    if (!validacionEspecialidad) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

    if (
      !permitirAsignacionInactiva &&
      validacionEspecialidad.estado_especialidad === 0
    ) {
      return res.status(400).json({ error: "Especialidad inactiva" });
    }

    const validacionAsignacion = await ProfesionalEspecialidad.query()
      .where({
        id_especialidad: especialidad_id,
        id_usuario: profesionalEspecialidadExiste.id_usuario,
        company_id,
      })
      .first();

    if (validacionAsignacion) {
      return res
        .status(409)
        .json({ error: "La especialidad ya esta asignada al profesional" });
    }

    await ProfesionalEspecialidad.query()
      .where({ id_asignacion })
      .patch({ id_especialidad: especialidad_id });

    /*LOGGER*/ await registrarNuevoLog(
      company_id,
      "Se ha editado la especialidad: " +
        profesionalEspecialidadExiste.id_especialidad +
        " del profesional: " +
        profesionalEspecialidadExiste.id_usuario +
        ". (Ejecutado por " +
        req.user.user_name +
        ")."
    );
    return res.status(201).json({
      message: "Asignacion editada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error al editar la asignacion" });
  }
}

module.exports = {
  assignEspecialidadAsAdmin,
  deleteEspecialidadAsAdmin,
  editAsignacionEspecialidadAsAdmin,

  assignEspecialidadAsClient,
  deleteEspecialidadAsClient,
  editAsignacionEspecialidadAsClient,
};
