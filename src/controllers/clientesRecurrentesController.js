const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida, enviarConflicto, enviarSinPermiso } = require("../helpers/responseHelpers");
const ClienteRecurrenteAdminService = require("../services/clientesRecurrentes/ClienteRecurrenteAdminService");
const ClienteRecurrenteOwnerService = require("../services/clientesRecurrentes/ClienteRecurrenteOwnerService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "No existe empresa bajo ese ID": () => enviarSolicitudInvalida(res, error.message),
    "El campo domicilio es obligatorio.": () => enviarSolicitudInvalida(res, error.message),
    "Ya existe un cliente recurrente con ese DNI o email": () => enviarConflicto(res, error.message),
    "Cliente no encontrado": () => enviarNoEncontrado(res, "Cliente"),
    "No se enviaron campos para actualizar.": () => enviarSolicitudInvalida(res, error.message),
    "El campo no puede estar vacío": () => enviarSolicitudInvalida(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

async function getAllClientesRecurrentes(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await getAllClientesRecurrentesAsAdmin(req, res);
      case "owner":
      case "operador":
        return await getAllClientesRecurrentesAsClient(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createClienteRecurrente(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await createClienteRecurrenteAsAdmin(req, res);
      case "owner":
      case "operador":
        return await createClienteRecurrenteAsClient(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para crear clientes recurrentes");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateClienteRecurrente(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await updateClienteRecurrenteAsAdmin(req, res);
      case "owner":
      case "operador":
        return await editarClienteAsClient(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para editar clientes recurrentes");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function blockClienteRecurrente(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await blockClienteRecurrenteAsAdmin(req, res);
      case "owner":
      case "operador":
        return await desactivarClienteAsClient(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para bloquear clientes recurrentes");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function unblockClienteRecurrente(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await unblockClienteRecurrenteAsAdmin(req, res);
      case "owner":
      case "operador":
        return await activarClienteAsClient(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para desbloquear clientes recurrentes");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getAllClientesRecurrentesAsAdmin(req, res) {
  const clientesRecurrentes = await ClienteRecurrenteAdminService.getAllClientesRecurrentes();
  return enviarLista(res, clientesRecurrentes);
}

async function getAllClientesRecurrentesAsClient(req, res) {
  const company_id = req.user.company_id;
  const clientesRecurrentes = await ClienteRecurrenteOwnerService.getClientesRecurrentesByCompany(company_id);
  return enviarLista(res, clientesRecurrentes);
}

async function createClienteRecurrenteAsAdmin(req, res) {
  const data = { ...req.body };
  await ClienteRecurrenteAdminService.createClienteRecurrente(data);
  return enviarExito(res, "Cliente recurrente creado correctamente");
}

async function createClienteRecurrenteAsClient(req, res) {
  const company_id = req.user.company_id;
  await ClienteRecurrenteOwnerService.createClienteRecurrente(req.body, company_id);
  return enviarExito(res, "Cliente recurrente creado correctamente");
}

async function updateClienteRecurrenteAsAdmin(req, res) {
  const { cliente_id } = req.params;
  await ClienteRecurrenteAdminService.updateClienteRecurrente(cliente_id, req.body);
  return enviarExito(res, "Cliente recurrente actualizado correctamente");
}

async function editarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;
  await ClienteRecurrenteOwnerService.updateClienteRecurrente(cliente_id, req.body, company_id);
  return enviarExito(res, "Cliente actualizado correctamente");
}

async function blockClienteRecurrenteAsAdmin(req, res) {
  const { cliente_id } = req.params;
  await ClienteRecurrenteAdminService.disableClienteRecurrente(cliente_id);
  return enviarExito(res, "Cliente recurrente bloqueado correctamente");
}

async function desactivarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;
  await ClienteRecurrenteOwnerService.disableClienteRecurrente(cliente_id, company_id);
  return enviarExito(res, "Cliente desactivado correctamente");
}

async function unblockClienteRecurrenteAsAdmin(req, res) {
  const { cliente_id } = req.params;
  await ClienteRecurrenteAdminService.enableClienteRecurrente(cliente_id);
  return enviarExito(res, "Cliente recurrente desbloqueado correctamente");
}

async function activarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;
  await ClienteRecurrenteOwnerService.enableClienteRecurrente(cliente_id, company_id);
  return enviarExito(res, "Cliente activado correctamente");
}

module.exports = {
  getAllClientesRecurrentesAsAdmin,
  getAllClientesRecurrentesAsClient,
  createClienteRecurrenteAsClient,
  editarClienteAsClient,
  activarClienteAsClient,
  desactivarClienteAsClient,
  getAllClientesRecurrentes,
  createClienteRecurrente,
  updateClienteRecurrente,
  blockClienteRecurrente,
  unblockClienteRecurrente,
};
