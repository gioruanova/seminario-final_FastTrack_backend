const ClienteRecurrente = require("../../models/ClienteRecurrente");
const Company = require("../../models/Company");
const ConfigService = require("../companyConfig/ConfigService");
const ClienteRecurrenteService = require("./ClienteRecurrenteService");
const { obtenerPorId } = require("../../helpers/registroHelpers");
const { validarCamposObligatorios } = require("../../helpers/validationHelpers");
const { existeClientePorDniOEmail } = ClienteRecurrenteService;

async function getAllClientesRecurrentes() {
  const clientesRecurrentes = await ClienteRecurrente.query();
  return clientesRecurrentes;
}

async function createClienteRecurrente(data) {
  const {
    cliente_complete_name,
    cliente_dni,
    cliente_phone,
    cliente_email,
    cliente_direccion,
    cliente_lat,
    cliente_lng,
    company_id,
  } = data;
  const camposRequeridos = [
    "cliente_complete_name",
    "cliente_dni",
    "cliente_phone",
    "cliente_email",
    "company_id",
  ];
  const validacion = validarCamposObligatorios(data, camposRequeridos);
  if (!validacion.valid) {
    throw new Error(validacion.error);
  }
  const company = await obtenerPorId(Company, company_id);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }
  const companyConfig = await ConfigService.getCompanyConfig(company_id);
  if (companyConfig.requiere_domicilio && !cliente_direccion) {
    throw new Error("El campo domicilio es obligatorio.");
  }
  const existe = await existeClientePorDniOEmail(company_id, cliente_dni, cliente_email);
  if (existe) {
    throw new Error("Ya existe un cliente recurrente con ese DNI o email");
  }
  await ClienteRecurrente.query().insertAndFetch({
    company_id,
    cliente_complete_name,
    cliente_dni,
    cliente_phone,
    cliente_email,
    cliente_direccion,
    cliente_lat,
    cliente_lng,
  });
  return true;
}
async function updateClienteRecurrente(clienteId, data) {
  const camposEditables = [
    "cliente_complete_name",
    "cliente_dni",
    "cliente_phone",
    "cliente_email",
    "cliente_direccion",
    "cliente_lat",
    "cliente_lng",
  ];
  const cliente = await ClienteRecurrente.query()
    .findById(clienteId)
    .first();
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  const camposOpcionales = ["cliente_lat", "cliente_lng"];
  const patchData = {};
  const camposVacios = [];
  for (const campo of camposEditables) {
    if (campo in data) {
      const valor = data[campo];
      const esOpcional = camposOpcionales.includes(campo);
      if (esOpcional) {
        if (valor === "" || (typeof valor === "string" && valor.trim() === "")) {
          throw new Error(`El campo '${campo}' no puede ser un string vacío. Use null para eliminarlo.`);
        }
        patchData[campo] = valor === null || valor === undefined ? null : valor;
      } else {
        if (valor === null || valor === undefined || valor === "") {
          camposVacios.push(campo);
        } else {
          patchData[campo] = valor;
        }
      }
    }
  }
  if (camposVacios.length > 0) {
    throw new Error(`El campo ${camposVacios.join(", ")} no puede estar vacío`);
  }
  if (Object.keys(patchData).length === 0) {
    throw new Error("No se enviaron campos para actualizar.");
  }
  if (patchData.cliente_dni || patchData.cliente_email) {
    const existe = await existeClientePorDniOEmail(
      cliente.company_id,
      patchData.cliente_dni || cliente.cliente_dni,
      patchData.cliente_email || cliente.cliente_email,
      clienteId
    );
    if (existe) {
      throw new Error("Ya existe un cliente recurrente con ese DNI o email");
    }
  }
  await ClienteRecurrente.query()
    .patch(patchData)
    .where({ cliente_id: clienteId });
  return true;
}
async function disableClienteRecurrente(clienteId) {
  const cliente = await ClienteRecurrente.query()
    .findById(clienteId)
    .first();
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  await ClienteRecurrenteService.disableClienteRecurrente(clienteId);
  return true;
}
async function enableClienteRecurrente(clienteId) {
  const cliente = await ClienteRecurrente.query()
    .findById(clienteId)
    .first();
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  await ClienteRecurrenteService.enableClienteRecurrente(clienteId);
  return true;
}
module.exports = {
  getAllClientesRecurrentes,
  createClienteRecurrente,
  updateClienteRecurrente,
  disableClienteRecurrente,
  enableClienteRecurrente,
};