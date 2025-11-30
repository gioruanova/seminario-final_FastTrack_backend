const ProfesionalEspecialidad = require("../../models/ProfesionalesEspecialidad");

async function existeAsignacion(profesional_id, especialidad_id) {
  const asignacion = await ProfesionalEspecialidad.query()
    .where({ id_usuario: profesional_id, id_especialidad: especialidad_id })
    .first();
  return !!asignacion;
}

async function existeAsignacionConEspecialidad(profesional_id, especialidad_id, excludeId = null) {
  const query = ProfesionalEspecialidad.query()
    .where({
      id_especialidad: especialidad_id,
      id_usuario: profesional_id,
    });

  if (excludeId) {
    query.whereNot("id_asignacion", excludeId);
  }

  const asignacion = await query.first();
  return !!asignacion;
}

module.exports = { existeAsignacion, existeAsignacionConEspecialidad, };