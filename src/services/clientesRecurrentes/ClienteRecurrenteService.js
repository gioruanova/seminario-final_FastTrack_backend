const ClienteRecurrente = require("../../models/ClienteRecurrente");
async function disableClienteRecurrente(clienteId) {
  const cliente = await ClienteRecurrente.query()
    .findById(clienteId)
    .first();
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  await ClienteRecurrente.query()
    .where({ cliente_id: clienteId })
    .patch({ cliente_active: false });
  return true;
}
async function enableClienteRecurrente(clienteId) {
  const cliente = await ClienteRecurrente.query()
    .findById(clienteId)
    .first();
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  await ClienteRecurrente.query()
    .where({ cliente_id: clienteId })
    .patch({ cliente_active: true });
  return true;
}
async function existeClientePorDniOEmail(company_id, cliente_dni, cliente_email, excludeId = null) {
  const query = ClienteRecurrente.query()
    .where("company_id", company_id)
    .andWhere((builder) => {
      builder
        .where("cliente_dni", cliente_dni)
        .orWhere("cliente_email", cliente_email);
    });
  if (excludeId) {
    query.whereNot("cliente_id", excludeId);
  }
  const existing = await query.first();
  return !!existing;
}
module.exports = { disableClienteRecurrente, enableClienteRecurrente, existeClientePorDniOEmail };