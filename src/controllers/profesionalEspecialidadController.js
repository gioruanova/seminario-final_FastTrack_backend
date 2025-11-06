// -----------------
// CONTROLADOR DE ASIGNACIONES PROFESIONAL-ESPECIALIDAD
// -----------------

const ProfesionalEspecialidad = require("../models/ProfesionalesEspecialidad");
const Especialidad = require("../models/Especialidad");
const { registrarNuevoLog } = require("../controllers/globalLogController");
const User = require("../models/User");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida, enviarConflicto } = require("../helpers/responseHelpers");

const permitirAsignacionInactiva = false;

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// ASIGNAR ESPECIALIDAD A PROFESIONAL
// -----------------
async function assignEspecialidadAsAdmin(req, res) {
  try {
    const { profesional_id, especialidad_id } = req.body;

    if (!profesional_id || !especialidad_id) {
      return enviarSolicitudInvalida(res, "El profesional y la especialidad son requeridos");
    }

    const profesionalExiste = await User.query()
      .findById(profesional_id)
      .where("user_role", "profesional");

    if (!profesionalExiste) {
      return enviarNoEncontrado(res, "Profesional");
    }

    const especialidadExiste = await Especialidad.query()
      .findById(especialidad_id)
      .where("company_id", profesionalExiste.company_id);

    if (!especialidadExiste) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (
      !permitirAsignacionInactiva &&
      especialidadExiste.estado_especialidad === 0
    ) {
      return enviarSolicitudInvalida(res, "Especialidad inactiva");
    }

    const asignacion = await ProfesionalEspecialidad.query()
      .where({ id_usuario: profesional_id, id_especialidad: especialidad_id })
      .first();

    if (asignacion) {
      return enviarConflicto(res, "La especialidad ya esta asignada al profesional");
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
    return enviarExito(res, "Especialidad asignada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al asignar la especialidad", 500);
  }
}

// -----------------
// ELIMINAR ESPECIALIDAD DE UN PROFESIONAL
// -----------------
async function deleteEspecialidadAsAdmin(req, res) {
  try {
    const { id_asignacion } = req.params;

    if (!id_asignacion) {
      return enviarSolicitudInvalida(res, "Es necesario el id de la asignacion");
    }

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion })
      .first();

    if (!profesionalEspecialidadExiste) {
      return enviarNoEncontrado(res, "Asignación de Especialidad-Profesional");
    }

    await ProfesionalEspecialidad.query().where({ id_asignacion }).delete();

    /*LOGGER*/ await registrarNuevoLog(
      profesionalEspecialidadExiste.company_id,
      "Se ha eliminado la especialidad: " +
      profesionalEspecialidadExiste.id_especialidad +
      " del profesional: " +
      profesionalEspecialidadExiste.id_usuario
    );
    return enviarExito(res, "Especialidad eliminada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al eliminar la especialidad", 500);
  }
}

// -----------------
// EDITAR ASIGNACIÓN
// -----------------
async function editAsignacionEspecialidadAsAdmin(req, res) {
  try {
    const { id_asignacion } = req.params;
    const { especialidad_id } = req.body;

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion })
      .first();

    if (!profesionalEspecialidadExiste) {
      return enviarNoEncontrado(res, "Asignación de Especialidad-Profesional");
    }

    if (!especialidad_id) {
      return enviarSolicitudInvalida(res, "Es necesario el id de la especialidad");
    }

    const validacionEspecialidad = await Especialidad.query()
      .where({
        id_especialidad: especialidad_id,
        company_id: profesionalEspecialidadExiste.company_id,
      })
      .first();

    if (!validacionEspecialidad) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (
      !permitirAsignacionInactiva &&
      validacionEspecialidad.estado_especialidad === 0
    ) {
      return enviarSolicitudInvalida(res, "Especialidad inactiva");
    }

    const validacionAsignacion = await ProfesionalEspecialidad.query()
      .where({
        id_especialidad: especialidad_id,
        id_usuario: profesionalEspecialidadExiste.id_usuario,
      })
      .first();

    if (validacionAsignacion) {
      return enviarConflicto(res, "La especialidad ya esta asignada al profesional");
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
    return enviarExito(res, "Asignacion actualizada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al actualizar la asignacion", 500);
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES):
// -----------------

// -----------------
// ASIGNAR ESPECIALIDAD A PROFESIONAL
// -----------------
async function assignEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;
  try {
    const { profesional_id, especialidad_id } = req.body;

    if (!profesional_id || !especialidad_id) {
      return enviarSolicitudInvalida(res, "Es necesario el id del profesional y la especialidad");
    }

    const validacionEspecialidad = await Especialidad.query()
      .where({
        id_especialidad: especialidad_id,
        company_id,
      })
      .first();

    if (!validacionEspecialidad) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (
      !permitirAsignacionInactiva &&
      validacionEspecialidad.estado_especialidad === 0
    ) {
      return enviarSolicitudInvalida(res, "Especialidad inactiva");
    }

    const validacionProfesional = await User.query()
      .where({
        user_id: profesional_id,
        user_role: "profesional",
        company_id,
      })
      .first();

    if (!validacionProfesional) {
      return enviarNoEncontrado(res, "Profesional");
    }

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({
        id_especialidad: especialidad_id,
        id_usuario: profesional_id,
        company_id: company_id,
      })
      .first();

    if (profesionalEspecialidadExiste) {
      return enviarConflicto(res, "La especialidad ya esta asignada al profesional");
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
    return enviarExito(res, "Especialidad asignada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al asignar la especialidad", 500);
  }
}

// -----------------
// ELIMINAR ESPECIALIDAD DE UN PROFESIONAL
// -----------------
async function deleteEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;
  try {
    const { id_asignacion } = req.params;

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion, company_id })
      .first();

    if (!profesionalEspecialidadExiste) {
      return enviarNoEncontrado(res, "Asignación de Especialidad-Profesional");
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
    return enviarExito(res, "Asignacion eliminada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al eliminar la asignacion", 500);
  }
}

// -----------------
// EDITAR ASIGNACIÓN
// -----------------
async function editAsignacionEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;
  try {
    const { id_asignacion } = req.params;
    const { especialidad_id } = req.body;

    const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
      .where({ id_asignacion, company_id })
      .first();

    if (!profesionalEspecialidadExiste) {
      return enviarNoEncontrado(res, "Asignación de Especialidad-Profesional");
    }

    const validacionEspecialidad = await Especialidad.query()
      .where({
        id_especialidad: especialidad_id,
        company_id,
      })
      .first();

    if (!validacionEspecialidad) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (
      !permitirAsignacionInactiva &&
      validacionEspecialidad.estado_especialidad === 0
    ) {
      return enviarSolicitudInvalida(res, "Especialidad inactiva");
    }

    const validacionAsignacion = await ProfesionalEspecialidad.query()
      .where({
        id_especialidad: especialidad_id,
        id_usuario: profesionalEspecialidadExiste.id_usuario,
        company_id,
      })
      .first();

    if (validacionAsignacion) {
      return enviarConflicto(res, "La especialidad ya esta asignada al profesional");
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
    return enviarExito(res, "Asignacion editada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error al editar la asignacion", 500);
  }
}

// -----------------
// OBTENER ASIGNACIONES PROFESIONAL-ESPECIALIDAD
// -----------------
async function getProfesionalEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;

  try {
    if (!company_id) {
      return enviarSolicitudInvalida(res, "Company ID no encontrado");
    }

    const profesionalEspecialidad = await ProfesionalEspecialidad.query()
      .select(
        'profesionales_especialidad.id_usuario as profesional_id',
        'usuario.user_complete_name as profesional_nombre',
        'profesionales_especialidad.id_especialidad as especialidad_id',
        'Especialidad.nombre_especialidad as especialidad_nombre'
      )
      .join('users as usuario', 'profesionales_especialidad.id_usuario', 'usuario.user_id')
      .join('especialidades as Especialidad', 'profesionales_especialidad.id_especialidad', 'Especialidad.id_especialidad')
      .where('profesionales_especialidad.company_id', company_id);

    return enviarLista(res, profesionalEspecialidad);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

module.exports = {
  assignEspecialidadAsAdmin,
  deleteEspecialidadAsAdmin,
  editAsignacionEspecialidadAsAdmin,

  getProfesionalEspecialidadAsClient,
  assignEspecialidadAsClient,
  deleteEspecialidadAsClient,
  editAsignacionEspecialidadAsClient,
};
