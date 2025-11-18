// -----------------
// CONTROLADOR DE ESPECIALIDADES
// -----------------

const Company = require("../models/Company");
const companyController = require("./companyController");
const Especialidad = require("../models/Especialidad");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida, enviarConflicto } = require("../helpers/responseHelpers");
const { obtenerPorId } = require("../helpers/registroHelpers");

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// CREAR ESPECIALIDAD
// -----------------
async function createEspecialidadAsAdmin(req, res) {
  try {
    const { company_id, nombre_especialidad } = req.body;

    if (!nombre_especialidad || !company_id) {
      return enviarSolicitudInvalida(res, "nombre_especialidad y company_id son requeridos");
    }

    const companyExist = await obtenerPorId(Company, company_id);

    if (!companyExist) {
      return enviarSolicitudInvalida(res, "No existe empresa bajo ese ID");
    }

    const existing = await Especialidad.query()
      .where({ company_id: company_id, nombre_especialidad })
      .first();

    if (existing) {
      return enviarConflicto(res, "La especialidad ya existe para esta empresa");
    }

    await Especialidad.query().insert({
      company_id,
      nombre_especialidad,
    });


    return enviarExito(res, "Especialidad creada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR ESPECIALIDAD
// -----------------
async function updateEspecialidadAsAdmin(req, res) {
  try {
    const { especialidadId } = req.params;
    const { nombre_especialidad } = req.body;

    if (!nombre_especialidad || !especialidadId) {
      return enviarSolicitudInvalida(res, "El campo nombre_especialidad es requerido");
    }

    const especialidadExiste = await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .first();

    if (!especialidadExiste) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    const existente = await Especialidad.query()
      .where({
        company_id: especialidadExiste.company_id,
        nombre_especialidad,
      })
      .first();

    if (existente) {
      return enviarConflicto(res, "La especialidad ya existe para esta empresa");
    }

    await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .update({
        nombre_especialidad: nombre_especialidad,
        company_id: especialidadExiste.company_id,
      });


    return enviarExito(res, "Especialidad actualizada correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER TODAS LAS ESPECIALIDADES
// -----------------
async function getAllEspecialidadesAsAdmin(req, res) {
  try {
    const especialidades = await Especialidad.query().select("*");
    return enviarLista(res, especialidades);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER ESPECIALIDADES POR EMPRESA
// -----------------
async function getAllEspecialidadesByCompanyAsAdmin(req, res) {
  try {
    const { company_id } = req.params;

    const especialidades = await Especialidad.query()
      .where({ company_id })
      .select("*");
    return enviarLista(res, especialidades);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESACTIVAR ESPECIALIDAD
// -----------------
async function disableEspecialidadAsAdmin(req, res) {
  try {
    const { especialidadId } = req.params;

    if (!especialidadId) {
      return enviarSolicitudInvalida(res, "El campo id_especialidad es requerido");
    }

    const especialidadExiste = await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .first();

    if (!especialidadExiste) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (especialidadExiste.estado_especialidad === 0) {
      return enviarSolicitudInvalida(res, "Especialidad ya esta desactivada");
    }

    await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .update({
        estado_especialidad: false,
        nombre_especialidad: especialidadExiste.nombre_especialidad,
        company_id: especialidadExiste.company_id,
      });


    return enviarExito(res, "Especialidad desactivada correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTIVAR ESPECIALIDAD
// -----------------
async function enableEspecialidadAsAdmin(req, res) {
  try {
    const { especialidadId } = req.params;

    if (!especialidadId) {
      return enviarSolicitudInvalida(res, "El campo id_especialidad es requerido");
    }

    const especialidadExiste = await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .first();

    if (!especialidadExiste) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (especialidadExiste.estado_especialidad === 1) {
      return enviarSolicitudInvalida(res, "Especialidad ya esta activada");
    }

    await Especialidad.query()
      .where({ id_especialidad: especialidadId })
      .update({
        estado_especialidad: true,
        nombre_especialidad: especialidadExiste.nombre_especialidad,
        company_id: especialidadExiste.company_id,
      });


    return enviarExito(res, "Especialidad activada correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA USER:
// -----------------

// -----------------
// OBTENER TODAS LAS ESPECIALIDADES
// -----------------
async function getAllEspecialidades(req, res) {
  try {
    const company_id = req.user?.company_id;
    const especialidades = await Especialidad.query().where({ company_id });
    return enviarLista(res, especialidades);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CREAR ESPECIALIDAD
// -----------------
async function createEspecialidadAsClient(req, res) {
  let limiteEspecialidades;
  let currentTotalEspecialidades;
  try {
    const { nombre_especialidad } = req.body;

    const comp_id = req.user?.company_id;

    if (!nombre_especialidad) {
      return enviarSolicitudInvalida(res, "nombre_especialidad son requeridos");
    }

    const existing = await Especialidad.query()
      .where({ company_id: comp_id, nombre_especialidad })
      .first();

    if (existing) {
      return enviarConflicto(res, "La especialidad ya existe para esta empresa");
    }

    limiteEspecialidades = await companyController.getLimitEspecialidades(
      comp_id
    );

    currentTotalEspecialidades = await getCurrentTotalEspecialidades(comp_id);

    if (currentTotalEspecialidades >= limiteEspecialidades) {
      return enviarSolicitudInvalida(res, "Has alcanzado el limite de especialidades");
    }

    await Especialidad.query().insert({
      nombre_especialidad,
      company_id: comp_id,
    });


    return enviarExito(res, "Especialidad creada correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR ESPECIALIDAD
// -----------------
async function updateEspecialidadAsClient(req, res) {
  try {
    const { especialidadId } = req.params;
    const { nombre_especialidad } = req.body;
    const company_id = req.user?.company_id;

    if (!nombre_especialidad) {
      return enviarSolicitudInvalida(res, "El campo nombre_especialidad es requerido");
    }

    const especialidad = await Especialidad.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidad) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    const existente = await Especialidad.query()
      .where({
        company_id,
        nombre_especialidad,
      })
      .whereNot("id_especialidad", especialidadId)
      .first();

    if (existente) {
      return enviarConflicto(res, "Ya existe una especialidad con ese nombre");
    }

    await Especialidad.query().patchAndFetchById(especialidadId, {
      nombre_especialidad,
    });


    return enviarExito(res, "Especialidad actualizada correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESACTIVAR ESPECIALIDAD
// -----------------
async function disableEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;

  try {
    const { especialidadId } = req.params;

    const especialidadToManage = await Especialidad.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidadToManage) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (especialidadToManage.estado_especialidad === 0) {
      return enviarSolicitudInvalida(res, "Especialidad ya esta desactivada");
    }

    await Especialidad.query().patchAndFetchById(especialidadId, {
      estado_especialidad: false,
      nombre_especialidad: especialidadToManage.nombre_especialidad,
      company_id: especialidadToManage.company_id,
    });


    return enviarExito(res, "Especialidad desactivada correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTIVAR ESPECIALIDAD
// -----------------
async function enableEspecialidadAsClient(req, res) {
  const company_id = req.user?.company_id;

  try {
    const { especialidadId } = req.params;

    const especialidadToManage = await Especialidad.query()
      .findById(especialidadId)
      .where("company_id", company_id);

    if (!especialidadToManage) {
      return enviarNoEncontrado(res, "Especialidad");
    }

    if (especialidadToManage.estado_especialidad === 1) {
      return enviarSolicitudInvalida(res, "Especialidad ya esta activada");
    }

    await Especialidad.query().patchAndFetchById(especialidadId, {
      estado_especialidad: true,
      nombre_especialidad: especialidadToManage.nombre_especialidad,
      company_id: especialidadToManage.company_id,
    });


    return enviarExito(res, "Especialidad activada correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// HELPERS
// -----------------

// -----------------
// OBTENER TOTAL DE ESPECIALIDADES ACTUALES POR EMPRESA
// -----------------
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
