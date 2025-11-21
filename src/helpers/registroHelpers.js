// HELPERS PARA OPERACIONES CON REGISTROS DE BASE DE DATOS
// ----------------------------------------------------------
// ----------------------------------------------------------

// -----------------
// OBTENER REGISTRO POR ID
// -----------------
async function obtenerPorId(Model, id, whereConditions = {}, withGraph = null) {
  let query = Model.query().findById(id);

  // Aplicar condiciones adicionales
  Object.keys(whereConditions).forEach(key => {
    query = query.where(key, whereConditions[key]);
  });

  // Aplicar relaciones
  if (withGraph) {
    query = query.withGraphFetched(withGraph);
  }

  return await query;
}

// -----------------
// OBTENER REGISTRO POR ID O ERROR 404
// -----------------
// NOTA: Esta función tiene dependencia de responseHelpers.
// Si necesitas evitar esta dependencia, usa obtenerPorId directamente y maneja el error en el controlador.
async function obtenerPorIdOError(Model, id, options = {}) {
  const {
    errorMessage = null,
    res = null,
    whereConditions = {},
    withGraph = null,
  } = options;

  const registro = await obtenerPorId(Model, id, whereConditions, withGraph);

  if (!registro) {
    const message = errorMessage || `${Model.name} no encontrado`;
    if (res) {
      const { enviarNoEncontrado } = require('./responseHelpers');
      return enviarNoEncontrado(res, Model.name);
    }
    return null;
  }

  return registro;
}

// -----------------
// VALDAR SI EXISTE UN REGISTRO
// -----------------
async function existe(Model, conditions) {
  const registro = await Model.query().where(conditions).first();
  return !!registro;
}

// -----------------
// CHEQUEAR SI HAY DUPLICADO
// -----------------
async function verificarDuplicado(Model, fields, excludeId = null) {
  let query = Model.query();

  if (typeof fields === 'object') {
    Object.keys(fields).forEach(key => {
      query = query.where(key, fields[key]);
    });
  } else {
    query = query.where(fields);
  }

  if (excludeId) {
    const idField = Model.idColumn || 'id';
    query = query.whereNot(idField, excludeId);
  }

  const existe = await query.first();
  return !!existe;
}

module.exports = {
  obtenerPorId,
  existe,
  verificarDuplicado,
  obtenerPorIdOError,
};
