const Especialidad = require("../../models/Especialidad");
const CompanyService = require("../company/CompanyService");
const EspecialidadService = require("./EspecialidadService");
const { existeEspecialidadPorNombre, getCurrentTotalEspecialidades } = EspecialidadService;

async function getEspecialidadesByCompany(company_id) {
  const especialidades = await Especialidad.query().where({ company_id });
  return especialidades;
}

async function createEspecialidad(data, company_id) {
  const { nombre_especialidad } = data;

  if (!nombre_especialidad) {
    throw new Error("nombre_especialidad son requeridos");
  }

  const existing = await existeEspecialidadPorNombre(company_id, nombre_especialidad);
  if (existing) {
    throw new Error("La especialidad ya existe para esta empresa");
  }

  const limiteEspecialidades = await CompanyService.getLimitEspecialidades(company_id);
  const currentTotalEspecialidades = await getCurrentTotalEspecialidades(company_id);

  if (currentTotalEspecialidades >= limiteEspecialidades) {
    throw new Error("Has alcanzado el limite de especialidades");
  }

  await Especialidad.query().insert({
    nombre_especialidad,
    company_id: company_id,
  });

  return true;
}

async function updateEspecialidad(especialidadId, data, company_id) {
  const { nombre_especialidad } = data;

  if (!nombre_especialidad) {
    throw new Error("El campo nombre_especialidad es requerido");
  }

  const especialidad = await Especialidad.query()
    .findById(especialidadId)
    .where("company_id", company_id);

  if (!especialidad) {
    throw new Error("Especialidad no encontrada");
  }

  const existente = await existeEspecialidadPorNombre(company_id, nombre_especialidad, especialidadId);
  if (existente) {
    throw new Error("Ya existe una especialidad con ese nombre");
  }

  await Especialidad.query().patchAndFetchById(especialidadId, {
    nombre_especialidad,
  });

  return true;
}

async function disableEspecialidad(especialidadId, company_id) {
  const especialidadToManage = await Especialidad.query()
    .findById(especialidadId)
    .where("company_id", company_id);

  if (!especialidadToManage) {
    throw new Error("Especialidad no encontrada");
  }

  if (especialidadToManage.estado_especialidad === 0) {
    throw new Error("Especialidad ya esta desactivada");
  }

  await EspecialidadService.disableEspecialidad(especialidadId);

  return true;
}

async function enableEspecialidad(especialidadId, company_id) {
  const especialidadToManage = await Especialidad.query()
    .findById(especialidadId)
    .where("company_id", company_id);

  if (!especialidadToManage) {
    throw new Error("Especialidad no encontrada");
  }

  if (especialidadToManage.estado_especialidad === 1) {
    throw new Error("Especialidad ya esta activada");
  }

  await EspecialidadService.enableEspecialidad(especialidadId);

  return true;
}

module.exports = { getEspecialidadesByCompany, createEspecialidad, updateEspecialidad, disableEspecialidad, enableEspecialidad, };