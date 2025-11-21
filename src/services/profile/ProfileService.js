const { filtrarCamposPermitidos } = require("../../helpers/validationHelpers");
const { obtenerPorId, verificarDuplicado } = require("../../helpers/registroHelpers");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const UserService = require("../users/UserService");

// -----------------
// OBTENER PERFIL PROPIO
// -----------------
async function getProfile(userId) {
  const user = await obtenerPorId(User, userId);

  if (!user) {
    throw new Error("No existe usuario bajo ese ID");
  }

  let company = null;
  if (user.user_role !== "superadmin") {
    company = await user.$relatedQuery("company").first();
  }

  if (user.user_role === "superadmin") {
    return {
      user_id: user.user_id,
      user_email: user.user_email,
      user_name: user.user_complete_name,
      user_role: user.user_role,
    };
  } else {
    return {
      user_id: user.user_id,
      user_email: user.user_email,
      user_name: user.user_complete_name,
      user_role: user.user_role,
      company_id: company?.company_id || null,
      company_name: company?.company_nombre || null,
      company_status: company?.company_estado || null,
      user_phone: user.user_phone || null,
      company_phone: company?.company_phone || null,
      company_email: company?.company_email || null,
      company_whatsapp: company?.company_whatsapp || null,
      company_telegram: company?.company_telegram || null,
      user_dni: user.user_dni || null,
    };
  }
}

// -----------------
// ACTUALIZAR PERFIL PROPIO
// -----------------
async function updateProfile(userId, data, companyId) {
  const allowedFields = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_status",
  ];

  // Validar que el usuario existe y pertenece a la empresa
  const user = await obtenerPorId(User, userId, { company_id: companyId });
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

  // Verificar duplicados (excluyendo el propio usuario)
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

  // cambio de password solo si difere
  if (patchData.user_password) {
    const same = await bcrypt.compare(patchData.user_password, user.user_password);
    if (same) delete patchData.user_password;
    else patchData.user_password = UserService.hashPassword(patchData.user_password);
  }

  await User.query().findById(userId).patch(patchData);
  return true;
}

module.exports = { getProfile, updateProfile};
