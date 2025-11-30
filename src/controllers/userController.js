const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, enviarSinPermiso, enviarConflicto, } = require("../helpers/responseHelpers");

const UserAdminService = require("../services/users/UserAdminService");
const UserOwnerService = require("../services/users/UserOwnerService");
const UserOperadorService = require("../services/users/UserOperadorService");
const UserService = require("../services/users/UserService");

function manejarError(error, res) {
  const mensajesConocidos = {
    "El email ya está registrado": () => enviarConflicto(res, error.message),
    "El DNI ya está registrado": () => enviarConflicto(res, error.message),
    "El email o DNI ya está registrado": () => enviarConflicto(res, error.message),
    "No existe usuario bajo ese ID": () => enviarSolicitudInvalida(res, error.message),
    "No existe empresa bajo ese ID": () => enviarSolicitudInvalida(res, error.message),
    "Limite de operadores alcanzado": () => enviarSolicitudInvalida(res, error.message),
    "Limite de profesionales alcanzado": () => enviarSolicitudInvalida(res, error.message),
    "No tenés permiso para crear este tipo de usuario": () => enviarSinPermiso(res, error.message),
    "No tenés permiso para gestionar este usuario": () => enviarSinPermiso(res, error.message),
    "No puedes bloquear tu propio usuario": () => enviarSolicitudInvalida(res, error.message),
    "No puedes desbloquear tu propio usuario": () => enviarSolicitudInvalida(res, error.message),
    "El usuario ya estaba bloqueado": () => enviarSolicitudInvalida(res, error.message),
    "El usuario ya estaba desbloqueado": () => enviarSolicitudInvalida(res, error.message),
    "El usuario ya se encuentra habilitado": () => enviarSolicitudInvalida(res, error.message),
    "Debes ingresar una nueva contraseña": () => enviarSolicitudInvalida(res, error.message),
    "Rol no autorizado": () => enviarSinPermiso(res, error.message),
  };

  if (mensajesConocidos[error.message]) {
    return mensajesConocidos[error.message]();
  }

  return enviarError(res, "Error interno del servidor", 500);
}

async function getUsers(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await getUsersAsAdmin(req, res);
      case "owner":
        return await getUsersAsOwner(req, res);
      case "operador":
        return await getUsersAsOperador(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getUsersByCompany(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    if (role !== "superadmin") {
      return enviarSinPermiso(res, "Solo superadmin puede listar usuarios por empresa");
    }

    return await getUsersByCompanyAsAdmin(req, res);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createUser(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await createUserAsAdmin(req, res);
      case "owner":
        return await createUserAsOwner(req, res);
      case "operador":
        return await createUserAsOperador(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para crear usuarios");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateUser(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await updateUserAsAdmin(req, res);
      case "owner":
        return await updateUserAsOwner(req, res);
      case "operador":
        return await updateUserAsOperador(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para editar usuarios");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function blockUser(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await blockUserAsAdmin(req, res);
      case "owner":
        return await blockUserAsOwner(req, res);
      case "operador":
        return await blockUserAsOperador(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para bloquear usuarios");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function unblockUser(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await unblockUserAsAdmin(req, res);
      case "owner":
        return await unblockUserAsOwner(req, res);
      case "operador":
        return await unblockUserAsOperador(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para desbloquear usuarios");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function restoreUser(req, res) {
  try {
    const role = req.user?.user_role || "superadmin";

    switch (role) {
      case "superadmin":
        return await restoreUserAsAdmin(req, res);
      case "owner":
        return await restoreUserAsOwner(req, res);
      case "operador":
        return await restoreUserAsOperador(req, res);
      default:
        return enviarSinPermiso(res, "Rol no autorizado para restaurar usuarios");
    }
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getUsersAsAdmin(req, res) {
  const users = await UserAdminService.getAllUsers();
  return enviarLista(res, users);
}

async function getUsersByCompanyAsAdmin(req, res) {
  const { company_id } = req.params;
  const users = await UserAdminService.getUsersByCompany(company_id);
  return enviarLista(res, users);
}

async function createUserAsAdmin(req, res) {
  await UserAdminService.createUser(req.body);
  return enviarExito(res, "Usuario creado correctamente", 201);
}

async function updateUserAsAdmin(req, res) {
  const { user_id } = req.params;
  await UserAdminService.updateUser(user_id, req.body);
  return enviarExito(res, "Usuario editado correctamente");
}

async function blockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  await UserService.blockUser(user_id);
  return enviarExito(res, "Usuario bloqueado correctamente");
}

async function unblockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  await UserService.unblockUser(user_id);
  return enviarExito(res, "Usuario desbloqueado correctamente");
}

async function restoreUserAsAdmin(req, res) {
  const { user_id } = req.params;
  const { new_password } = req.body;
  await UserAdminService.restoreUser(user_id, new_password);
  return enviarExito(res, "Usuario restaurado correctamente");
}

async function getUsersAsOwner(req, res) {
  const companyId = req.user.company_id;
  const users = await UserOwnerService.getUsersByCompany(companyId);
  return enviarLista(res, users);
}

async function createUserAsOwner(req, res) {
  const data = {
    ...req.body,
    company_id: req.user.company_id,
    creator: req.user,
  };
  await UserOwnerService.createUser(data, req.user);
  return enviarExito(res, "Usuario creado correctamente", 201);
}

async function updateUserAsOwner(req, res) {
  const { user_id } = req.params;
  const data = {
    ...req.body,
    company_id: req.user.company_id,
    creator: req.user,
  };
  await UserOwnerService.updateUser(user_id, data, req.user);
  return enviarExito(res, "Usuario editado correctamente");
}

async function blockUserAsOwner(req, res) {
  const { user_id } = req.params;
  await UserOwnerService.blockUser(user_id, req.user);
  return enviarExito(res, "Usuario bloqueado correctamente");
}

async function unblockUserAsOwner(req, res) {
  const { user_id } = req.params;
  await UserOwnerService.unblockUser(user_id, req.user);
  return enviarExito(res, "Usuario desbloqueado correctamente");
}

async function restoreUserAsOwner(req, res) {
  const { user_id } = req.params;
  const { new_password } = req.body;
  await UserOwnerService.restoreUser(user_id, new_password, req.user);
  return enviarExito(res, "Usuario restaurado correctamente");
}

async function getUsersAsOperador(req, res) {
  const companyId = req.user.company_id;
  const users = await UserOperadorService.getUsersByCompany(companyId);
  return enviarLista(res, users);
}

async function createUserAsOperador(req, res) {
  const data = {
    ...req.body,
    company_id: req.user.company_id,
    creator: req.user,
  };
  await UserOperadorService.createUser(data, req.user);
  return enviarExito(res, "Usuario creado correctamente", 201);
}

async function updateUserAsOperador(req, res) {
  const { user_id } = req.params;
  const data = {
    ...req.body,
    company_id: req.user.company_id,
    creator: req.user,
  };
  await UserOperadorService.updateUser(user_id, data, req.user);
  return enviarExito(res, "Usuario editado correctamente");
}

async function blockUserAsOperador(req, res) {
  const { user_id } = req.params;
  await UserOperadorService.blockUser(user_id, req.user);
  return enviarExito(res, "Usuario bloqueado correctamente");
}

async function unblockUserAsOperador(req, res) {
  const { user_id } = req.params;
  await UserOperadorService.unblockUser(user_id, req.user);
  return enviarExito(res, "Usuario desbloqueado correctamente");
}

async function restoreUserAsOperador(req, res) {
  const { user_id } = req.params;
  const { new_password } = req.body;
  await UserOperadorService.restoreUser(user_id, new_password, req.user);
  return enviarExito(res, "Usuario restaurado correctamente");
}

module.exports = { getUsers, getUsersByCompany, createUser, updateUser, blockUser, unblockUser, restoreUser };
