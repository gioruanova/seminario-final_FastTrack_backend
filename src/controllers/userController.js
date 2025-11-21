const { enviarLista, enviarExito, enviarError, enviarSolicitudInvalida, enviarSinPermiso, enviarConflicto, } = require("../helpers/responseHelpers");
const UserAdminService = require("../services/users/UserAdminService");
const UserOwnerService = require("../services/users/UserOwnerService");
const UserOperadorService = require("../services/users/UserOperadorService");
const UserService = require("../services/users/UserService");

// HELPER PARA MANEJAR ERRORES
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


// DISPATCHER: Obtener usuarios
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

// DISPATCHER: Obtener usuarios por empresa
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

// DISPATCHER: Crear usuario
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

// DISPATCHER: Actualizar usuario
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

// DISPATCHER: Bloquear usuario
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

// DISPATCHER: Desbloquear usuario
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

// DISPATCHER: Restaurar usuario
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

// MÉTODOS ESPECÍFICOS POR ROL: SUPERADMIN
async function getUsersAsAdmin(req, res) {
  try {
    const users = await UserAdminService.getAllUsers();
    return enviarLista(res, users);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function getUsersByCompanyAsAdmin(req, res) {
  try {
    const { company_id } = req.params;
    const users = await UserAdminService.getUsersByCompany(company_id);
    return enviarLista(res, users);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createUserAsAdmin(req, res) {
  try {
    await UserAdminService.createUser(req.body);
    return enviarExito(res, "Usuario creado correctamente", 201);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateUserAsAdmin(req, res) {
  try {
    const { user_id } = req.params;
    await UserAdminService.updateUser(user_id, req.body);
    return enviarExito(res, "Usuario editado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function blockUserAsAdmin(req, res) {
  try {
    const { user_id } = req.params;
    await UserService.blockUser(user_id);
    return enviarExito(res, "Usuario bloqueado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function unblockUserAsAdmin(req, res) {
  try {
    const { user_id } = req.params;
    await UserService.unblockUser(user_id);
    return enviarExito(res, "Usuario desbloqueado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function restoreUserAsAdmin(req, res) {
  try {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return enviarSolicitudInvalida(res, "Debes ingresar una nueva contraseña");
    }

    await UserService.resetPassword(user_id, new_password);
    await UserService.enableUser(user_id);
    return enviarExito(res, "Usuario restaurado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

// MÉTODOS ESPECÍFICOS POR ROL: OWNER
async function getUsersAsOwner(req, res) {
  try {
    const companyId = req.user.company_id;
    const users = await UserOwnerService.getUsersByCompany(companyId);
    return enviarLista(res, users);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createUserAsOwner(req, res) {
  try {
    const data = {
      ...req.body,
      company_id: req.user.company_id,
      creator: req.user,
    };
    await UserOwnerService.createUser(data, req.user);
    return enviarExito(res, "Usuario creado correctamente", 201);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateUserAsOwner(req, res) {
  try {
    const { user_id } = req.params;
    const data = {
      ...req.body,
      company_id: req.user.company_id,
      creator: req.user,
    };
    await UserOwnerService.updateUser(user_id, data, req.user);
    return enviarExito(res, "Usuario editado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function blockUserAsOwner(req, res) {
  try {
    const { user_id } = req.params;
    await UserOwnerService.blockUser(user_id, req.user);
    return enviarExito(res, "Usuario bloqueado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function unblockUserAsOwner(req, res) {
  try {
    const { user_id } = req.params;
    await UserOwnerService.unblockUser(user_id, req.user);
    return enviarExito(res, "Usuario desbloqueado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function restoreUserAsOwner(req, res) {
  try {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return enviarSolicitudInvalida(res, "Debes ingresar una nueva contraseña");
    }

    await UserOwnerService.restoreUser(user_id, new_password, req.user);
    return enviarExito(res, "Usuario restaurado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}


// MÉTODOS ESPECÍFICOS POR ROL: OPERADOR
async function getUsersAsOperador(req, res) {
  try {
    const companyId = req.user.company_id;
    const users = await UserOperadorService.getUsersByCompany(companyId);
    return enviarLista(res, users);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function createUserAsOperador(req, res) {
  try {
    const data = {
      ...req.body,
      company_id: req.user.company_id,
      creator: req.user,
    };
    await UserOperadorService.createUser(data, req.user);
    return enviarExito(res, "Usuario creado correctamente", 201);
  } catch (error) {
    return manejarError(error, res);
  }
}

async function updateUserAsOperador(req, res) {
  try {
    const { user_id } = req.params;
    const data = {
      ...req.body,
      company_id: req.user.company_id,
      creator: req.user,
    };
    await UserOperadorService.updateUser(user_id, data, req.user);
    return enviarExito(res, "Usuario editado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function blockUserAsOperador(req, res) {
  try {
    const { user_id } = req.params;
    await UserOperadorService.blockUser(user_id, req.user);
    return enviarExito(res, "Usuario bloqueado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function unblockUserAsOperador(req, res) {
  try {
    const { user_id } = req.params;
    await UserOperadorService.unblockUser(user_id, req.user);
    return enviarExito(res, "Usuario desbloqueado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

async function restoreUserAsOperador(req, res) {
  try {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return enviarSolicitudInvalida(res, "Debes ingresar una nueva contraseña");
    }

    await UserOperadorService.restoreUser(user_id, new_password, req.user);
    return enviarExito(res, "Usuario restaurado correctamente");
  } catch (error) {
    return manejarError(error, res);
  }
}

module.exports = { getUsers, getUsersByCompany, createUser, updateUser, blockUser, unblockUser, restoreUser };
