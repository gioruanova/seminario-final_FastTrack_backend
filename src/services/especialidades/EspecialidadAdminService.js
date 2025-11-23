const Especialidad = require("../../models/Especialidad");
const Company = require("../../models/Company");
const { obtenerPorId } = require("../../helpers/registroHelpers");
const EspecialidadService = require("./EspecialidadService");
const { existeEspecialidadPorNombre } = EspecialidadService;

async function createEspecialidad(data) {
  const { company_id, nombre_especialidad } = data;

  if (!nombre_especialidad || !company_id) {
    throw new Error("nombre_especialidad y company_id son requeridos");
  }

  const companyExist = await obtenerPorId(Company, company_id);
  if (!companyExist) {
    throw new Error("No existe empresa bajo ese ID");
  }

  const existing = await existeEspecialidadPorNombre(company_id, nombre_especialidad);
  if (existing) {
    throw new Error("La especialidad ya existe para esta empresa");
  }

  await Especialidad.query().insert({
    company_id,
    nombre_especialidad,
  });

  return true;
}

async function updateEspecialidad(especialidadId, data) {
  const { nombre_especialidad } = data;

  if (!nombre_especialidad) {
    throw new Error("El campo nombre_especialidad es requerido");
  }

  const especialidadExiste = await Especialidad.query()
    .where({ id_especialidad: especialidadId })
    .first();

  if (!especialidadExiste) {
    throw new Error("Especialidad no encontrada");
  }

  const existente = await existeEspecialidadPorNombre(
    especialidadExiste.company_id,
    nombre_especialidad,
    especialidadId
  );

  if (existente) {
    throw new Error("La especialidad ya existe para esta empresa");
  }

  await Especialidad.query()
    .where({ id_especialidad: especialidadId })
    .update({
      nombre_especialidad: nombre_especialidad,
      company_id: especialidadExiste.company_id,
    });

  return true;
}

async function getAllEspecialidades() {
  const especialidades = await Especialidad.query().select("*");
  return especialidades;
}

async function getEspecialidadesByCompany(company_id) {
  const especialidades = await Especialidad.query()
    .where({ company_id })
    .select("*");
  return especialidades;
}

async function disableEspecialidad(especialidadId) {
  const especialidadExiste = await Especialidad.query()
    .where({ id_especialidad: especialidadId })
    .first();

  if (!especialidadExiste) {
    throw new Error("Especialidad no encontrada");
  }

  if (especialidadExiste.estado_especialidad === 0) {
    throw new Error("Especialidad ya esta desactivada");
  }

  await EspecialidadService.disableEspecialidad(especialidadId);

  return true;
}

async function enableEspecialidad(especialidadId) {
  const especialidadExiste = await Especialidad.query()
    .where({ id_especialidad: especialidadId })
    .first();

  if (!especialidadExiste) {
    throw new Error("Especialidad no encontrada");
  }

  if (especialidadExiste.estado_especialidad === 1) {
    throw new Error("Especialidad ya esta activada");
  }

  await EspecialidadService.enableEspecialidad(especialidadId);

  return true;
}

module.exports = { createEspecialidad, updateEspecialidad, getAllEspecialidades, getEspecialidadesByCompany, disableEspecialidad, enableEspecialidad, };