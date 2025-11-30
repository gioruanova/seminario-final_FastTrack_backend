const ProfesionalEspecialidad = require("../../models/ProfesionalesEspecialidad");
const Especialidad = require("../../models/Especialidad");
const User = require("../../models/User");
const { existeAsignacion } = require("./ProfesionalEspecialidadService");

const permitirAsignacionInactiva = false;

async function assignEspecialidad(data) {
  const { profesional_id, especialidad_id } = data;

  if (!profesional_id || !especialidad_id) {
    throw new Error("El profesional y la especialidad son requeridos");
  }

  const profesionalExiste = await User.query()
    .findById(profesional_id)
    .where("user_role", "profesional");

  if (!profesionalExiste) {
    throw new Error("Profesional no encontrado");
  }

  const especialidadExiste = await Especialidad.query()
    .findById(especialidad_id)
    .where("company_id", profesionalExiste.company_id);

  if (!especialidadExiste) {
    throw new Error("Especialidad no encontrada");
  }

  if (!permitirAsignacionInactiva && especialidadExiste.estado_especialidad === 0) {
    throw new Error("Especialidad inactiva");
  }

  const asignacionExiste = await existeAsignacion(profesional_id, especialidad_id);
  if (asignacionExiste) {
    throw new Error("La especialidad ya esta asignada al profesional");
  }

  await ProfesionalEspecialidad.query().insert({
    id_usuario: profesional_id,
    company_id: profesionalExiste.company_id,
    id_especialidad: especialidad_id,
  });

  return true;
}

async function deleteAsignacion(id_asignacion) {
  if (!id_asignacion) {
    throw new Error("Es necesario el id de la asignacion");
  }

  const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
    .where({ id_asignacion })
    .first();

  if (!profesionalEspecialidadExiste) {
    throw new Error("Asignación de Especialidad-Profesional no encontrada");
  }

  await ProfesionalEspecialidad.query().where({ id_asignacion }).delete();

  return true;
}

async function updateAsignacion(id_asignacion, data) {
  const { especialidad_id } = data;

  const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
    .where({ id_asignacion })
    .first();

  if (!profesionalEspecialidadExiste) {
    throw new Error("Asignación de Especialidad-Profesional no encontrada");
  }

  if (!especialidad_id) {
    throw new Error("Es necesario el id de la especialidad");
  }

  const validacionEspecialidad = await Especialidad.query()
    .where({
      id_especialidad: especialidad_id,
      company_id: profesionalEspecialidadExiste.company_id,
    })
    .first();

  if (!validacionEspecialidad) {
    throw new Error("Especialidad no encontrada");
  }

  if (!permitirAsignacionInactiva && validacionEspecialidad.estado_especialidad === 0) {
    throw new Error("Especialidad inactiva");
  }

  const { existeAsignacionConEspecialidad } = require("./ProfesionalEspecialidadService");
  const validacionAsignacion = await existeAsignacionConEspecialidad(
    profesionalEspecialidadExiste.id_usuario,
    especialidad_id,
    id_asignacion
  );

  if (validacionAsignacion) {
    throw new Error("La especialidad ya esta asignada al profesional");
  }

  await ProfesionalEspecialidad.query()
    .where({ id_asignacion })
    .patch({ id_especialidad: especialidad_id });

  return true;
}

module.exports = { assignEspecialidad, deleteAsignacion, updateAsignacion, };