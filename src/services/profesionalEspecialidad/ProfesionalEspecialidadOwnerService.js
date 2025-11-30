const ProfesionalEspecialidad = require("../../models/ProfesionalesEspecialidad");
const Especialidad = require("../../models/Especialidad");
const User = require("../../models/User");
const { existeAsignacion, existeAsignacionConEspecialidad } = require("./ProfesionalEspecialidadService");

const permitirAsignacionInactiva = false;

async function getAsignaciones(company_id) {
  if (!company_id) {
    throw new Error("Company ID no encontrado");
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

  return profesionalEspecialidad;
}

async function assignEspecialidad(data, company_id) {
  const { profesional_id, especialidad_id } = data;

  if (!profesional_id || !especialidad_id) {
    throw new Error("Es necesario el id del profesional y la especialidad");
  }

  const validacionEspecialidad = await Especialidad.query()
    .where({
      id_especialidad: especialidad_id,
      company_id,
    })
    .first();

  if (!validacionEspecialidad) {
    throw new Error("Especialidad no encontrada");
  }

  if (!permitirAsignacionInactiva && validacionEspecialidad.estado_especialidad === 0) {
    throw new Error("Especialidad inactiva");
  }

  const validacionProfesional = await User.query()
    .where({
      user_id: profesional_id,
      user_role: "profesional",
      company_id,
    })
    .first();

  if (!validacionProfesional) {
    throw new Error("Profesional no encontrado");
  }

  const asignacionExiste = await existeAsignacion(profesional_id, especialidad_id);
  if (asignacionExiste) {
    throw new Error("La especialidad ya esta asignada al profesional");
  }

  await ProfesionalEspecialidad.query().insert({
    id_especialidad: especialidad_id,
    id_usuario: profesional_id,
    company_id,
  });

  return true;
}

async function deleteAsignacion(id_asignacion, company_id) {
  const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
    .where({ id_asignacion, company_id })
    .first();

  if (!profesionalEspecialidadExiste) {
    throw new Error("Asignación de Especialidad-Profesional no encontrada");
  }

  await ProfesionalEspecialidad.query().where({ id_asignacion }).delete();

  return true;
}

async function updateAsignacion(id_asignacion, data, company_id) {
  const { especialidad_id } = data;

  const profesionalEspecialidadExiste = await ProfesionalEspecialidad.query()
    .where({ id_asignacion, company_id })
    .first();

  if (!profesionalEspecialidadExiste) {
    throw new Error("Asignación de Especialidad-Profesional no encontrada");
  }

  const validacionEspecialidad = await Especialidad.query()
    .where({
      id_especialidad: especialidad_id,
      company_id,
    })
    .first();

  if (!validacionEspecialidad) {
    throw new Error("Especialidad no encontrada");
  }

  if (!permitirAsignacionInactiva && validacionEspecialidad.estado_especialidad === 0) {
    throw new Error("Especialidad inactiva");
  }

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

module.exports = { getAsignaciones, assignEspecialidad, deleteAsignacion, updateAsignacion, };