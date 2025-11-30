const Reclamo = require("../../models/Reclamo");
const User = require("../../models/User");
const ReclamoService = require("./ReclamoService");
const ConfigService = require("../companyConfig/ConfigService");
const NotificationsService = require("../notifications/NotificationsService");

async function getReclamos(companyId, profesionalId) {
  return await ReclamoService.fetchReclamosByCompanyId(companyId, profesionalId);
}

async function getReclamoById(reclamoId, companyId, profesionalId) {
  const resultado = await ReclamoService.fetchReclamosByCompanyId(companyId, profesionalId);

  const reclamo = resultado.find((r) => r.reclamo_id === reclamoId);
  if (!reclamo) {
    throw new Error("Reclamo no encontrado");
  }

  return reclamo;
}

async function updateReclamo(reclamoId, data, companyId, profesionalId) {
  const { reclamo_nota_cierre, reclamo_presupuesto, reclamo_estado } = data;

  if (reclamo_estado === "CERRADO" || reclamo_estado === "CANCELADO") {
    if (!reclamo_nota_cierre) {
      throw new Error("La nota de cierre es requerida");
    }
  }

  const reclamoExiste = await Reclamo.query()
    .where("reclamo_id", reclamoId)
    .andWhere("company_id", companyId)
    .first();

  if (!reclamoExiste) {
    throw new Error("Reclamo no encontrado");
  }

  if (reclamoExiste.reclamo_estado === "CERRADO" || reclamoExiste.reclamo_estado === "CANCELADO") {
    throw new Error("El reclamo ya esta cerrado");
  }

  const reclamoActualizado = await Reclamo.query().patchAndFetchById(
    reclamoId,
    {
      reclamo_nota_cierre,
      reclamo_presupuesto,
      reclamo_estado,
    }
  );

  if (reclamoActualizado) {
    const resultado = await ReclamoService.fetchReclamosByCompanyId(companyId, profesionalId);

    const companyConfig = await ConfigService.getCompanyConfig(reclamoExiste.company_id);
    const compUsers = await User.query().select().where("user_role", "operador");
  }

  return reclamoActualizado;
}

module.exports = { getReclamos, getReclamoById, updateReclamo };
