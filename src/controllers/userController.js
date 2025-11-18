// -----------------
// CONTROLADOR DE USUARIOS
// -----------------
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("../models/User");
const Company = require("../models/Company");
const companyController = require("./companyController");
const companyConfigController = require("./companyConfigController");
const {
  enviarLista,
  enviarExito,
  enviarError,
  enviarNoEncontrado,
  enviarSolicitudInvalida,
  enviarSinPermiso,
  enviarConflicto,
} = require("../helpers/responseHelpers");
const {
  obtenerPorId,
  verificarDuplicado,
} = require("../helpers/registroHelpers");
const {
  validarCamposObligatorios,
  filtrarCamposPermitidos,
  validarUserRole,
} = require("../helpers/validationHelpers");

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// CREAR USUARIO COMO ADMIN
// -----------------
async function createUserAsAdmin(req, res) {
  const {
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password,
    user_role,
    company_id,
  } = req.body;

  try {
    // Validar campos base requeridos
    const camposBaseRequeridos = [
      "user_complete_name",
      "user_dni",
      "user_phone",
      "user_email",
      "user_password",
      "user_role",
    ];
    const validacionBase = validarCamposObligatorios(
      req.body,
      camposBaseRequeridos
    );
    if (!validacionBase.valid) {
      return enviarSolicitudInvalida(res, validacionBase.error);
    }

    // Validar y normalizar user_role
    const validacionRole = validarUserRole(user_role);
    if (!validacionRole.valid) {
      return enviarSolicitudInvalida(
        res,
        "El rol de usuario no es válido. Roles permitidos: superadmin, owner, operador, profesional"
      );
    }

    // Si NO es superadmin, company_id es requerido
    if (validacionRole.normalized !== "superadmin") {
      if (!company_id) {
        return enviarSolicitudInvalida(
          res,
          "company_id es requerido para roles que no sean superadmin"
        );
      }
      const company = await obtenerPorId(Company, company_id);
      if (!company) {
        return enviarSolicitudInvalida(res, "No existe empresa bajo ese ID");
      }
    }
    // Si es superadmin, company_id puede ser null (no se valida)

    const existingUser = await User.query()
      .where("user_email", user_email)
      .orWhere("user_dni", user_dni)
      .first();

    if (existingUser) {
      return enviarConflicto(res, "El email o DNI ya está registrado");
    }

    const newUser = await User.query().insert({
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_password: bcrypt.hashSync(user_password, saltRounds),
      user_role: validacionRole.normalized,
      company_id:
        validacionRole.normalized === "superadmin" ? null : company_id,
    });

    return enviarExito(res, "Usuario creado correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// EDITAR USUARIO COMO ADMIN
// -----------------
async function editUserAsAdmin(req, res) {
  const { user_id } = req.params;
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

  try {
    const user = await obtenerPorId(User, user_id);
    if (!user) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    const {
      data: patchData,
      hasEmpty,
      empty: camposVacios,
    } = filtrarCamposPermitidos(req.body, allowedFields, true);

    if (hasEmpty) {
      return enviarSolicitudInvalida(
        res,
        `El campo ${camposVacios.join(", ")} no puede estar vacío`
      );
    }

    if (Object.keys(patchData).length === 0) {
      return enviarSolicitudInvalida(
        res,
        "No se proporcionaron campos para actualizar"
      );
    }

    if (patchData.company_id) {
      const company = await obtenerPorId(Company, patchData.company_id);
      if (!company) {
        return enviarSolicitudInvalida(res, "No existe empresa bajo ese ID");
      }
    }

    if (patchData.user_email) {
      const existe = await verificarDuplicado(
        User,
        { user_email: patchData.user_email },
        user_id
      );
      if (existe) {
        return enviarConflicto(res, "El email ya está registrado");
      }
    }

    if (patchData.user_dni) {
      const existe = await verificarDuplicado(
        User,
        { user_dni: patchData.user_dni },
        user_id
      );
      if (existe) {
        return enviarConflicto(res, "El DNI ya está registrado");
      }
    }

    if (patchData.user_password) {
      const same = await bcrypt.compare(
        patchData.user_password,
        user.user_password
      );
      if (same) delete patchData.user_password;
      else
        patchData.user_password = bcrypt.hashSync(
          patchData.user_password,
          saltRounds
        );
    }

    await User.query().findById(user_id).patch(patchData);

    return enviarExito(res, "Usuario editado correctamente");
  } catch (e) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER TODOS LOS USUARIOS
// -----------------
async function getUsersAsAdmin(req, res) {
  try {
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

    return enviarLista(res, users);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER USUARIOS POR EMPRESA
// -----------------
async function getUsersByCompanyAsAdmin(req, res) {
  const companyId = req.params.company_id;

  try {
    const users = await User.query().where("company_id", companyId);
    return enviarLista(res, users);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// BLOQUEAR USUARIO
// -----------------
async function blockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  try {
    const userToBlock = await obtenerPorId(User, user_id);
    if (!userToBlock) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }
    if (userToBlock.user_status === 0) {
      return enviarSolicitudInvalida(res, "El usuario ya estaba bloqueado");
    }

    await bloquearUsuarioPorId(user_id);

    return enviarExito(res, "Usuario bloqueado correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESBLOQUEAR USUARIO
// -----------------
async function unblockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  try {
    const userToUnblock = await obtenerPorId(User, user_id);
    if (!userToUnblock) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }
    if (userToUnblock.user_status === 1) {
      return enviarSolicitudInvalida(res, "El usuario ya estaba desbloqueado");
    }
    await desbloquearUsuarioPorId(user_id);

    return enviarExito(res, "Usuario desbloqueado correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// RESTAURAR USUARIO (POST RESETEO CONTRASEÑA)
// -----------------
async function restoreUserAsAdmin(req, res) {
  try {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return enviarSolicitudInvalida(
        res,
        "Debes ingresar una nueva contraseña"
      );
    }

    const userToRestore = await obtenerPorId(User, user_id);
    if (!userToRestore) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    if (userToRestore.user_status === 1) {
      return enviarSolicitudInvalida(
        res,
        "El usuario ya se encuentra habilitado"
      );
    }

    await resetPassword(user_id, new_password);
    habilitarUsuarioPorId(user_id);

    return enviarExito(res, "Usuario restaurado correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES):
// -----------------

// -----------------
// CREAR USUARIO COMO CLIENTE
// -----------------
async function createUserAsClient(req, res) {
  const creator = req.user;
  let limiteOperadores;
  let currentTotalOperadores;

  let limiteProfesionales;
  let currentTotalProfesionales;
  const company_id = creator.company_id;

  const {
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password,
    user_role,
  } = req.body;

  try {
    const camposRequeridos = [
      "user_complete_name",
      "user_dni",
      "user_phone",
      "user_email",
      "user_password",
      "user_role",
    ];
    const validacion = validarCamposObligatorios(req.body, camposRequeridos);
    if (!validacion.valid) {
      return enviarSolicitudInvalida(res, validacion.error);
    }

    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      return enviarSolicitudInvalida(res, "No existe empresa bajo ese ID");
    }

    const existingUser = await User.query().findOne({ user_email });
    if (existingUser) {
      return enviarConflicto(res, "El email ya está registrado");
    }

    if (!canCreateRole(creator.user_role, user_role)) {
      return enviarSinPermiso(
        res,
        "No tenés permiso para crear este tipo de usuario"
      );
    }

    limiteOperadores = await companyController.getLimitOperator(company_id);
    limiteProfesionales = await companyController.getLimitProfesionales(
      company_id
    );

    currentTotalOperadores = await getCurrentTotalOperadores(company_id);
    currentTotalProfesionales = await getCurrentTotalProfesionales(company_id);

    if (user_role == "operador" && currentTotalOperadores >= limiteOperadores) {
      return enviarSolicitudInvalida(res, "Limite de operadores alcanzado");
    }

    if (
      user_role == "profesional" &&
      currentTotalProfesionales >= limiteProfesionales
    ) {
      return enviarSolicitudInvalida(res, "Limite de profesionales alcanzado");
    }

    const newUser = await User.query().insert({
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_password: bcrypt.hashSync(user_password, saltRounds),
      user_role,
      company_id,
    });

    return enviarExito(res, "Usuario creado correctamente", 201);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// EDITAR USUARIO COMO CLIENTE
// -----------------
async function editUserAsClient(req, res) {
  const creator = req.user;
  const company_id = creator.company_id;
  let limiteOperadores;
  let currentTotalOperadores;
  let limiteProfesionales;
  let currentTotalProfesionales;

  const { user_id } = req.params;

  const allowedFields = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_role",
    "user_status",
  ];

  try {
    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      return enviarSolicitudInvalida(res, "No existe empresa bajo ese ID");
    }

    const user = await obtenerPorId(User, user_id, { company_id });
    if (!user) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    const {
      data: patchData,
      hasEmpty,
      empty: camposVacios,
    } = filtrarCamposPermitidos(req.body, allowedFields, true);

    if (hasEmpty) {
      return enviarSolicitudInvalida(
        res,
        `El campo ${camposVacios.join(", ")} no puede estar vacío`
      );
    }

    if (Object.keys(patchData).length === 0) {
      return enviarSolicitudInvalida(
        res,
        "No se proporcionaron campos para actualizar"
      );
    }

    if (
      patchData.user_role &&
      !canCreateRole(creator.user_role, patchData.user_role)
    ) {
      return enviarSinPermiso(
        res,
        "No tenés permiso para crear este tipo de usuario"
      );
    }

    limiteOperadores = await companyController.getLimitOperator(company_id);
    limiteProfesionales = await companyController.getLimitProfesionales(
      company_id
    );

    currentTotalOperadores = await getCurrentTotalOperadores(company_id);
    currentTotalProfesionales = await getCurrentTotalProfesionales(company_id);

    if (
      patchData.user_role == "operador" &&
      currentTotalOperadores >= limiteOperadores
    ) {
      return enviarSolicitudInvalida(res, "Limite de operadores alcanzado");
    }

    if (
      patchData.user_role == "profesional" &&
      currentTotalProfesionales >= limiteProfesionales
    ) {
      return enviarSolicitudInvalida(res, "Limite de profesionales alcanzado");
    }

    if (patchData.user_email) {
      const existe = await verificarDuplicado(
        User,
        { user_email: patchData.user_email },
        user_id
      );
      if (existe) {
        return enviarConflicto(res, "El email ya está registrado");
      }
    }

    if (patchData.user_dni) {
      const existe = await verificarDuplicado(
        User,
        { user_dni: patchData.user_dni },
        user_id
      );
      if (existe) {
        return enviarConflicto(res, "El DNI ya está registrado");
      }
    }

    if (patchData.user_password) {
      const same = await bcrypt.compare(
        patchData.user_password,
        user.user_password
      );
      if (same) delete patchData.user_password;
      else
        patchData.user_password = bcrypt.hashSync(
          patchData.user_password,
          saltRounds
        );
    }

    await User.query().findById(user_id).patch(patchData);

    return enviarExito(res, "Usuario editado correctamente");
  } catch (e) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER USUARIOS COMO CLIENTE
// -----------------
async function getUsersAsClient(req, res) {

  const companyId = req.user.company_id;

  try {
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

    return enviarLista(res, users);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// BLOQUEAR USUARIO COMO CLIENTE
// -----------------
async function blockUserAsClient(req, res) {
  const companyId = req.user.company_id;
  const { user_id } = req.params;

  try {
    const userToBlock = await obtenerPorId(User, user_id, {
      company_id: companyId,
    });

    if (!userToBlock) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    if (!canManageAccess(req.user.user_role, userToBlock.user_role)) {
      return enviarSinPermiso(
        res,
        "No tenés permiso para gestionar este usuario"
      );
    }

    if (userToBlock.user_id === req.user.user_id)
      return enviarSolicitudInvalida(
        res,
        "No puedes bloquear tu propio usuario"
      );

    if (userToBlock.user_status === 0)
      return enviarSolicitudInvalida(res, "El usuario ya estaba bloqueado");

    await bloquearUsuarioPorId(user_id);

    return enviarExito(res, "Usuario bloqueado correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESBLOQUEAR USUARIO COMO CLIENTE
// -----------------
async function unblockUserAsClient(req, res) {
  const companyId = req.user.company_id;
  const { user_id } = req.params;

  try {
    const userToUnblock = await obtenerPorId(User, user_id, {
      company_id: companyId,
    });

    if (!userToUnblock) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    if (!canManageAccess(req.user.user_role, userToUnblock.user_role)) {
      return enviarSinPermiso(
        res,
        "No tenés permiso para gestionar este usuario"
      );
    }

    if (userToUnblock.user_id === req.user.user_id)
      return enviarSolicitudInvalida(
        res,
        "No puedes desbloquear tu propio usuario"
      );

    if (userToUnblock.user_status === 1)
      return enviarSolicitudInvalida(res, "El usuario ya estaba desbloqueado");

    await desbloquearUsuarioPorId(user_id);

    return enviarExito(res, "Usuario desbloqueado correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// RESTAURAR USUARIO COMO CLIENTE (POST RESETEO)
// -----------------
async function restoreUserAsClient(req, res) {
  try {
    const companyId = req.user.company_id;
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return enviarSolicitudInvalida(
        res,
        "Debes ingresar una nueva contraseña"
      );
    }

    const userToRestore = await obtenerPorId(User, user_id, {
      company_id: companyId,
    });
    if (!userToRestore) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    if (userToRestore.user_status === 1) {
      return enviarSolicitudInvalida(
        res,
        "El usuario ya se encuentra habilitado"
      );
    }

    if (!canManageAccess(req.user.user_role, userToRestore.user_role)) {
      return enviarSinPermiso(
        res,
        "No tenés permiso para gestionar este usuario"
      );
    }

    await resetPassword(user_id, new_password);
    habilitarUsuarioPorId(user_id);

    return enviarExito(res, "Usuario restaurado correctamente");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA PROFESIONAL:
// -----------------

// -----------------
// OBTENER ESTADO ACTUAL DE CARGA DE TRABAJO
// -----------------
async function getWorkloadState(req, res) {
  const user_id = req.user.user_id;

  try {
    const userWorkloadState = await obtenerPorId(User, user_id);
    return res.json(
      userWorkloadState.apto_recibir == 1
        ? { enabled: true }
        : { enabled: false }
    );
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// HABILITAR RECIBIR TRABAJO
// -----------------
async function enableReceiveWork(req, res) {
  const user_id = req.user.user_id;

  try {
    const userAvailableWork = await obtenerPorId(User, user_id);

    if (userAvailableWork.apto_recibir === 1) {
      return enviarSolicitudInvalida(
        res,
        "El profesional ya estaba habilitado para recibir trabajos"
      );
    }

    await User.query().findById(user_id).patch({ apto_recibir: true });

    return enviarExito(res, "Recibir trabajo habilitado");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESHABILITAR RECIBIR TRABAJO
// -----------------
async function disableReceiveWork(req, res) {
  const user_id = req.user.user_id;

  try {
    const userAvailableWork = await obtenerPorId(User, user_id);

    if (userAvailableWork.apto_recibir === 0) {
      return enviarSolicitudInvalida(
        res,
        "El profesional ya estaba deshabilitado para recibir trabajos"
      );
    }

    await User.query().findById(user_id).patch({ apto_recibir: false });

    return enviarExito(res, "Recibir trabajo deshabilitado");
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// HELPERS DE PERMISOS:
// -----------------

// -----------------
// VERIFICAR SI SE PUEDE CREAR ROL
// -----------------
function canCreateRole(creatorRole, newUserRole) {
  const permissions = {
    owner: ["operador", "profesional"],
    operador: ["profesional"],
    profesional: [""],
  };
  return permissions[creatorRole]?.includes(newUserRole);
}

// -----------------
// VERIFICAR SI SE PUEDE GESTIONAR ACCESO
// -----------------
function canManageAccess(actorRole, targetRole) {
  const permissions = {
    owner: ["operador", "profesional"],
    operador: ["profesional"],
    profesional: [],
  };

  return permissions[actorRole]?.includes(targetRole);
}

// -----------------
// OBTENER TOTAL DE OPERADORES ACTUAL POR EMPRESA
// -----------------
async function getCurrentTotalOperadores(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "operador" })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

// -----------------
// OBTENER TOTAL DE PROFESIONALES ACTUAL POR EMPRESA
// -----------------
async function getCurrentTotalProfesionales(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "profesional" })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

// -----------------
// HELPERS DE GESTIÓN DE USUARIOS:
// -----------------

// -----------------
// BLOQUEAR USUARIO POR ID
// -----------------
async function bloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, {
    user_status: false,
  });
}

// -----------------
// DESBLOQUEAR USUARIO POR ID
// -----------------
async function desbloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, {
    user_status: true,
  });
}

// -----------------
// HABILITAR USUARIO POR ID
// -----------------
async function habilitarUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, {
    user_status: true,
  });
}

// -----------------
// RESETEAR CONTRASEÑA
// -----------------
async function resetPassword(user_id, newPassword) {
  const passWordToUpdate = bcrypt.hashSync(newPassword, saltRounds);
  await User.query().findById(user_id).patch({
    user_password: passWordToUpdate,
  });
}

// -----------------
// VISTAS:
// -----------------

// -----------------
// OBTENER DETALLES DE PROFESIONALES
// -----------------
async function fetchProfesionalesDetail(companyId) {
  const configCompany =
    await companyConfigController.fetchCompanySettingsByCompanyId(companyId);

  const users = await User.query()
    .select("*")
    .where({ company_id: companyId, user_role: "profesional" })
    .withGraphFetched("especialidades.Especialidad(selectNombreEspecialidad)")
    .modifiers({
      selectNombreEspecialidad(builder) {
        builder.select("nombre_especialidad");
      },
    });

  return users.map((user) => ({
    ID: user.user_id,
    DNI: user.user_dni,
    [`Nombre - ${configCompany.sing_heading_profesional}`]:
      user.user_complete_name,
    Telefono: user.user_phone,
    Email: user.user_email,
    [`${configCompany.sing_heading_especialidad}(s)`]: user.especialidades
      .map((e) => e.Especialidad.nombre_especialidad)
      .join(", "),
  }));
}

// -----------------
// OBTENER DETALLES DE PROFESIONALES COMO CLIENTE
// -----------------
async function getProfesionalesDetailAsClient(req, res) {
  try {
    const companyId = req.user.company_id;
    const data = await fetchProfesionalesDetail(companyId);

    return enviarLista(res, data);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// GESTIONAR PERFIL
// -----------------
async function manageProfile(req, res) {
  const company_id = req.user.company_id;
  const user_id = req.user.user_id;

  const allowedFields = [
    "user_complete_name",
    "user_dni",
    "user_phone",
    "user_email",
    "user_password",
    "user_status",
  ];

  try {
    const user = await obtenerPorId(User, user_id, { company_id });
    if (!user) {
      return enviarSolicitudInvalida(res, "No existe usuario bajo ese ID");
    }

    const {
      data: patchData,
      hasEmpty,
      empty: camposVacios,
    } = filtrarCamposPermitidos(req.body, allowedFields, true);

    if (hasEmpty) {
      return enviarSolicitudInvalida(
        res,
        `El campo ${camposVacios.join(", ")} no puede estar vacío`
      );
    }

    if (Object.keys(patchData).length === 0) {
      return enviarSolicitudInvalida(
        res,
        "No se proporcionaron campos para actualizar"
      );
    }

    if (patchData.user_email) {
      const existe = await verificarDuplicado(
        User,
        { user_email: patchData.user_email },
        user_id
      );
      if (existe) {
        return enviarConflicto(res, "El email ya está registrado");
      }
    }

    if (patchData.user_dni) {
      const existe = await verificarDuplicado(
        User,
        { user_dni: patchData.user_dni },
        user_id
      );
      if (existe) {
        return enviarConflicto(res, "El DNI ya está registrado");
      }
    }

    if (patchData.user_password) {
      const same = await bcrypt.compare(
        patchData.user_password,
        user.user_password
      );
      if (same) delete patchData.user_password;
      else
        patchData.user_password = bcrypt.hashSync(
          patchData.user_password,
          saltRounds
        );
    }

    await User.query().findById(user_id).patch(patchData);

    return enviarExito(res, "Usuario editado correctamente");
  } catch (e) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

module.exports = {
  getUsersAsAdmin,
  getUsersByCompanyAsAdmin,
  createUserAsAdmin,
  editUserAsAdmin,
  blockUserAsAdmin,
  unblockUserAsAdmin,
  restoreUserAsAdmin,

  getUsersAsClient,
  createUserAsClient,
  editUserAsClient,
  blockUserAsClient,
  unblockUserAsClient,
  restoreUserAsClient,

  manageProfile,
  getWorkloadState,
  enableReceiveWork,
  disableReceiveWork,

  // metodos auxiliares
  bloquearUsuarioPorId,

  // VISTAS
  fetchProfesionalesDetail,
  getProfesionalesDetailAsClient,
};
