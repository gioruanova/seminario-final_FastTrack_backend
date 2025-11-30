const bcrypt = require("bcrypt");
const User = require("../../models/User");
const Company = require("../../models/Company");
const UserService = require("./UserService");
const { obtenerPorId, verificarDuplicado } = require("../../helpers/registroHelpers");
const { validarCamposObligatorios, validarUserRole, filtrarCamposPermitidos } = require("../../helpers/validationHelpers");

async function createUser(data) {
  const {
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password,
    user_role,
    company_id,
  } = data;

  // Validar campos base requeridos
  const camposBaseRequeridos = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_role",
  ];
  const validacionBase = validarCamposObligatorios(data, camposBaseRequeridos);
  if (!validacionBase.valid) {
    throw new Error(validacionBase.error);
  }

  // Validar y normalizar user_role
  const validacionRole = validarUserRole(user_role);
  if (!validacionRole.valid) {
    throw new Error(
      "El rol de usuario no es válido. Roles permitidos: superadmin, owner, operador, profesional"
    );
  }

  // Si NO es superadmin, company_id es requerido
  if (validacionRole.normalized !== "superadmin") {
    if (!company_id) {
      throw new Error("company_id es requerido para roles que no sean superadmin");
    }
    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      throw new Error("No existe empresa bajo ese ID");
    }
  }

  // Verificar duplicados
  const existingUser = await User.query()
    .where("user_email", user_email)
    .orWhere("user_dni", user_dni)
    .first();

  if (existingUser) {
    throw new Error("El email o DNI ya está registrado");
  }

  // Crear usuario
  const newUser = await User.query().insert({
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password: UserService.hashPassword(user_password),
    user_role: validacionRole.normalized,
    company_id: validacionRole.normalized === "superadmin" ? null : company_id,
  });

  return newUser;
}

async function updateUser(userId, data) {
  const allowedFields = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_role",
    "user_status",
    "company_id",
  ];

  const user = await obtenerPorId(User, userId);
  if (!user) {
    throw new Error("No existe usuario bajo ese ID");
  }

  const {
    data: patchData,
    hasEmpty,
    empty: camposVacios,
  } = filtrarCamposPermitidos(data, allowedFields, true);

  if (hasEmpty) {
    throw new Error(`El campo ${camposVacios.join(", ")} no puede estar vacío`);
  }

  if (Object.keys(patchData).length === 0) {
    throw new Error("No se proporcionaron campos para actualizar");
  }

  if (patchData.company_id) {
    const company = await obtenerPorId(Company, patchData.company_id);
    if (!company) {
      throw new Error("No existe empresa bajo ese ID");
    }
  }

  if (patchData.user_email) {
    const existe = await verificarDuplicado(
      User,
      { user_email: patchData.user_email },
      userId
    );
    if (existe) {
      throw new Error("El email ya está registrado");
    }
  }

  if (patchData.user_dni) {
    const existe = await verificarDuplicado(
      User,
      { user_dni: patchData.user_dni },
      userId
    );
    if (existe) {
      throw new Error("El DNI ya está registrado");
    }
  }

  if (patchData.user_password) {
    const same = await bcrypt.compare(patchData.user_password, user.user_password);
    if (same) delete patchData.user_password;
    else patchData.user_password = UserService.hashPassword(patchData.user_password);
  }

  await User.query().findById(userId).patch(patchData);
  return true;
}

async function getAllUsers() {
  const users = await User.query().select(
    "user_id",
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_role",
    "user_status",
    "company_id",
    "created_at",
    "updated_at"
  );
  return users;
}

async function getUsersByCompany(companyId) {
  const users = await User.query().where("company_id", companyId);
  return users;
}

async function restoreUser(userId, newPassword) {
  if (!newPassword) {
    throw new Error("Debes ingresar una nueva contraseña");
  }

  const user = await obtenerPorId(User, userId);
  if (!user) {
    throw new Error("No existe usuario bajo ese ID");
  }

  if (user.user_status === 1) {
    throw new Error("El usuario ya se encuentra habilitado");
  }

  await UserService.resetPassword(userId, newPassword);
  await UserService.enableUser(userId);
  return true;
}

module.exports = { createUser, updateUser, getAllUsers, getUsersByCompany, restoreUser };

