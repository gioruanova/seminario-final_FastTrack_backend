async function obtenerPorId(Model, id, whereConditions = {}, withGraph = null) {
  let query = Model.query().findById(id);

  Object.keys(whereConditions).forEach(key => {
    query = query.where(key, whereConditions[key]);
  });

  if (withGraph) {
    query = query.withGraphFetched(withGraph);
  }

  return await query;
}

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

async function existe(Model, conditions) {
  const registro = await Model.query().where(conditions).first();
  return !!registro;
}

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
