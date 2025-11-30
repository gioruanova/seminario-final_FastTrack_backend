const Especialidad = require("../../models/Especialidad");

async function getCurrentTotalEspecialidades(company_id) {
  const result = await Especialidad.query()
    .where({ company_id })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

async function disableEspecialidad(especialidadId) {
  const especialidad = await Especialidad.query()
    .findById(especialidadId)
    .first();

  if (!especialidad) {
    throw new Error("Especialidad no encontrada");
  }

  await Especialidad.query()
    .where({ id_especialidad: especialidadId })
    .update({
      estado_especialidad: false,
      nombre_especialidad: especialidad.nombre_especialidad,
      company_id: especialidad.company_id,
    });

  return true;
}

async function enableEspecialidad(especialidadId) {
  const especialidad = await Especialidad.query()
    .findById(especialidadId)
    .first();

  if (!especialidad) {
    throw new Error("Especialidad no encontrada");
  }

  await Especialidad.query()
    .where({ id_especialidad: especialidadId })
    .update({
      estado_especialidad: true,
      nombre_especialidad: especialidad.nombre_especialidad,
      company_id: especialidad.company_id,
    });

  return true;
}

async function existeEspecialidadPorNombre(company_id, nombre_especialidad, excludeId = null) {
  const query = Especialidad.query()
    .where({ company_id, nombre_especialidad });

  if (excludeId) {
    query.whereNot("id_especialidad", excludeId);
  }

  const existing = await query.first();
  return !!existing;
}

module.exports = { getCurrentTotalEspecialidades, disableEspecialidad, enableEspecialidad, existeEspecialidadPorNombre, };