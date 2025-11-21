const bcrypt = require("bcrypt");
const User = require("../../models/User");
const Company = require("../../models/Company");
const UserService = require("./UserService");
const { obtenerPorId, verificarDuplicado } = require("../../helpers/registroHelpers");
const { validarCamposObligatorios, filtrarCamposPermitidos } = require("../../helpers/validationHelpers");

function canCreateRole(creatorRole, newUserRole) {
  const permissions = {
    owner: ["operador", "profesional"],
    operador: ["profesional"],
    profesional: [""],
  };
  return permissions[creatorRole]?.includes(newUserRole);
}

function canManageAccess(actorRole, targetRole) {
  const permissions = {
    owner: ["operador", "profesional"],
    operador: ["profesional"],
    profesional: [],
  };
  return permissions[actorRole]?.includes(targetRole);
}

async function getCurrentTotalOperadores(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "operador" })
    .count()
    .first();
  return parseInt(result["count(*)"], 10);
}

async function getCurrentTotalProfesionales(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "profesional" })
    .count()
    .first();
  return parseInt(result["count(*)"], 10);
}

async function createUser(data, creator) {
  const {
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password,
    user_role,
  } = data;

  const company_id = creator.company_id;

  // Validar campos requeridos
  const camposRequeridos = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_role",
  ];
  const validacion = validarCamposObligatorios(data, camposRequeridos);
  if (!validacion.valid) {
    throw new Error(validacion.error);
  }

  // Validar empresa
  const company = await obtenerPorId(Company, company_id);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }

  // Verificar duplicados
  const existingUser = await User.query().findOne({ user_email });
  if (existingUser) {
    throw new Error("El email ya está registrado");
  }

  // Validar permisos de creación
  if (!canCreateRole(creator.user_role, user_role)) {
    throw new Error("No tenés permiso para crear este tipo de usuario");
  }

  // Verificar límites (reutilizar company ya obtenida)
  const limiteOperadores = company?.limite_operadores || 0;
  const limiteProfesionales = company?.limite_profesionales || 0;

  const currentTotalOperadores = await getCurrentTotalOperadores(company_id);
  const currentTotalProfesionales = await getCurrentTotalProfesionales(company_id);

  if (user_role == "operador" && currentTotalOperadores >= limiteOperadores) {
    throw new Error("Limite de operadores alcanzado");
  }

  if (user_role == "profesional" && currentTotalProfesionales >= limiteProfesionales) {
    throw new Error("Limite de profesionales alcanzado");
  }

  // Crear usuario
  const newUser = await User.query().insert({
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password: UserService.hashPassword(user_password),
    user_role,
    company_id,
  });

  return newUser;
}

async function updateUser(userId, data, creator) {
  const company_id = creator.company_id;

  const allowedFields = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_role",
    "user_status",
  ];

  // Validar empresa
  const company = await obtenerPorId(Company, company_id);
  if (!company) {
    throw new Error("No existe empresa bajo ese ID");
  }

  // Validar que el usuario pertenece a la empresa
  const user = await obtenerPorId(User, userId, { company_id });
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

  // Validar permisos si cambia el rol
  if (patchData.user_role && !canCreateRole(creator.user_role, patchData.user_role)) {
    throw new Error("No tenés permiso para crear este tipo de usuario");
  }

  // Verificar límites si cambia el rol
  if (patchData.user_role) {
    // Reutilizar la variable company ya obtenida arriba
    const limiteOperadores = company?.limite_operadores || 0;
    const limiteProfesionales = company?.limite_profesionales || 0;

    const currentTotalOperadores = await getCurrentTotalOperadores(company_id);
    const currentTotalProfesionales = await getCurrentTotalProfesionales(company_id);

    if (patchData.user_role == "operador" && currentTotalOperadores >= limiteOperadores) {
      throw new Error("Limite de operadores alcanzado");
    }

    if (patchData.user_role == "profesional" && currentTotalProfesionales >= limiteProfesionales) {
      throw new Error("Limite de profesionales alcanzado");
    }
  }

  // Verificar duplicados
  if (patchData.user_email) {
    const existe = await verificarDuplicado(User, { user_email: patchData.user_email }, userId);
    if (existe) {
      throw new Error("El email ya está registrado");
    }
  }

  if (patchData.user_dni) {
    const existe = await verificarDuplicado(User, { user_dni: patchData.user_dni }, userId);
    if (existe) {
      throw new Error("El DNI ya está registrado");
    }
  }

  // Manejar contraseña
  if (patchData.user_password) {
    const same = await bcrypt.compare(patchData.user_password, user.user_password);
    if (same) delete patchData.user_password;
    else patchData.user_password = UserService.hashPassword(patchData.user_password);
  }

  await User.query().findById(userId).patch(patchData);
  return true;
}

async function getUsersByCompany(companyId) {
  const users = await User.query()
    .select(
      "user_id",
      "user_complete_name",
      "user_dni",
      "user_phone",
      "user_email",
      "user_role",
      "user_status",
      "company_id",
      "created_at",
      "updated_at",
      "apto_recibir"
    )
    .where("company_id", companyId)
    .withGraphFetched("especialidades.Especialidad(selectNombreEspecialidad)")
    .modifiers({
      selectNombreEspecialidad(builder) {
        builder.select("nombre_especialidad");
      },
    });

  return users;
}

// -----------------
// BLOQUEAR USUARIO
// -----------------
async function blockUser(userId, creator) {
  const companyId = creator.company_id;

  const userToBlock = await obtenerPorId(User, userId, { company_id: companyId });
  if (!userToBlock) {
    throw new Error("No existe usuario bajo ese ID");
  }

  if (!canManageAccess(creator.user_role, userToBlock.user_role)) {
    throw new Error("No tenés permiso para gestionar este usuario");
  }

  if (userToBlock.user_id === creator.user_id) {
    throw new Error("No puedes bloquear tu propio usuario");
  }

  if (userToBlock.user_status === 0) {
    throw new Error("El usuario ya estaba bloqueado");
  }

  await UserService.blockUser(userId);
  return true;
}

// -----------------
// DESBLOQUEAR USUARIO
// -----------------
async function unblockUser(userId, creator) {
  const companyId = creator.company_id;

  const userToUnblock = await obtenerPorId(User, userId, { company_id: companyId });
  if (!userToUnblock) {
    throw new Error("No existe usuario bajo ese ID");
  }

  if (!canManageAccess(creator.user_role, userToUnblock.user_role)) {
    throw new Error("No tenés permiso para gestionar este usuario");
  }

  if (userToUnblock.user_id === creator.user_id) {
    throw new Error("No puedes desbloquear tu propio usuario");
  }

  if (userToUnblock.user_status === 1) {
    throw new Error("El usuario ya estaba desbloqueado");
  }

  await UserService.unblockUser(userId);
  return true;
}

// -----------------
// RESTAURAR USUARIO
// -----------------
async function restoreUser(userId, newPassword, creator) {
  const companyId = creator.company_id;

  if (!newPassword) {
    throw new Error("Debes ingresar una nueva contraseña");
  }

  const userToRestore = await obtenerPorId(User, userId, { company_id: companyId });
  if (!userToRestore) {
    throw new Error("No existe usuario bajo ese ID");
  }

  if (userToRestore.user_status === 1) {
    throw new Error("El usuario ya se encuentra habilitado");
  }

  if (!canManageAccess(creator.user_role, userToRestore.user_role)) {
    throw new Error("No tenés permiso para gestionar este usuario");
  }

  await UserService.resetPassword(userId, newPassword);
  await UserService.enableUser(userId);
  return true;
}

module.exports = { createUser, updateUser, getUsersByCompany, blockUser, unblockUser, restoreUser, };

