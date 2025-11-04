const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("../models/User");
const userLogController = require("./UserLogController");
const Company = require("../models/Company");
const companyController = require("./companyController");
const companyConfigController = require("./companyConfigController");
const messageController = require("./messageController");

const { registrarNuevoLog } = require("../controllers/globalLogController");

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Crear usuario como admin
// ---------------------------------------------------------
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
    if (!user_complete_name || !user_dni || !user_phone || !user_email || !user_password || !user_role || !company_id) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const company = await Company.query().findById(company_id);

    if (!company) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const existingUser = await User.query()
      .where("user_email", user_email)
      .orWhere("user_dni", user_dni)
      .first();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "El email o DNI ya está registrado" });
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

    /*LOGGER*/ await registrarNuevoLog(
      newUser.company_id,
      "El usuario " +
      newUser.user_complete_name +
      " ha sido creado" +
      " (Ejecutado por Sistema)"
    );

    return res
      .status(201)
      .json({ success: true, message: "Usuario creado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Editar Usuario
// ---------------------------------------------------------
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
    const user = await User.query().findById(user_id);
    if (!user)
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });

    const patchData = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        const val = req.body[field];
        if (!val || val.toString().trim() === "")
          return res
            .status(400)
            .json({ error: `El campo ${field} no puede estar vacío` });
        patchData[field] = val;
      }
    }

    if (patchData.company_id) {
      const company = await Company.query().findById(patchData.company_id);
      if (!company)
        return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    if (patchData.user_email) {
      const exists = await User.query()
        .where("user_email", patchData.user_email)
        .whereNot("user_id", user_id)
        .first();
      if (exists)
        return res.status(400).json({ error: "El email ya está registrado" });
    }

    if (patchData.user_dni) {
      const exists = await User.query()
        .where("user_dni", patchData.user_dni)
        .whereNot("user_id", user_id)
        .first();
      if (exists)
        return res.status(400).json({ error: "El DNI ya está registrado" });
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

    /*LOGGER*/ await registrarNuevoLog(
      user.company_id,
      "El usuario " +
      user.user_complete_name +
      " ha sido editado." +
      " (Ejecutado por Sistema)"
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario editado correctamente" });
  } catch (e) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Obtener todos lo suaurios
// ---------------------------------------------------------
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

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Obtener todos lo suaurios
// ---------------------------------------------------------
async function getUsersByCompanyAsAdmin(req, res) {
  const companyId = req.params.company_id;

  try {
    const users = await User.query().where("company_id", companyId);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Bloquear usuario
// ---------------------------------------------------------
async function blockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  try {
    const userToBlock = await User.query().findById(user_id);
    if (!userToBlock) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }
    if (userToBlock.user_status === 0)
      return res.status(400).json({ error: "El usuario ya estaba bloqueado" });

    await bloquearUsuarioPorId(user_id);

    /*LOGGER*/ await registrarNuevoLog(
      userToBlock.company_id,
      "El usuario " +
      userToBlock.user_complete_name +
      " ha sido bloqueado." +
      " (Ejecutado por Sistema)"
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario bloqueado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Desbloquear usuario
// ---------------------------------------------------------
async function unblockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  try {
    const userToUnblock = await User.query().findById(user_id);
    if (!userToUnblock) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }
    if (userToUnblock.user_status === 1)
      return res
        .status(400)
        .json({ error: "El usuario ya estaba desbloqueado" });
    await desbloquearUsuarioPorId(user_id);

    /*LOGGER*/ await registrarNuevoLog(
      userToUnblock.company_id,
      "El usuario " +
      userToUnblock.user_complete_name +
      " ha sido desbloqueado." +
      " (Ejecutado por Sistema)"
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario desbloqueado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Restaurar usuario (post reseto contraseña)
// ---------------------------------------------------------
async function restoreUserAsAdmin(req, res) {
  try {
    const { user_id } = req.params;
    const userToRestore = await User.query().findById(user_id);
    const { new_password } = req.body;
    if (!new_password) {
      return res
        .status(400)
        .json({ error: "Debes ingresar una nueva contraseña" });
    }
    if (!userToRestore) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }
    if (userToRestore.user_status === 1) {
      return res
        .status(400)
        .json({ error: "El usuario ya se encuentra habilitado" });
    }

    await resetPassword(user_id, new_password);
    habilitarUsuarioPorId(user_id);



    await messageController.createMessageCustom({
      platform_message_title: "Cuenta reestablecida",
      platform_message_content: "Hemos restablecido tu cuenta con una contraseña provisoria. Te recomendamos cambiarla por una más segura desde la seccion de tu Perfil.",
      user_id: userToRestore.user_id,
      company_id: userToRestore.company_id,
      company_name: userToRestore.company_name,
    });

    /*LOGGER*/ await registrarNuevoLog(
      userToRestore.company_id,
      "El usuario " +
      userToRestore.user_complete_name +
      " ha sido desbloqueado y la contraseña ha sido reestablecida." +
      " (Ejecutado por Sistema)"
    );



    return res
      .status(200)
      .json({ success: true, message: "Usuario restaurado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================

// CONTROLADORES PARA USER
// ---------------------------------------------------------
// Crear usuario como usuario
// ---------------------------------------------------------
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

    if (!user_complete_name || !user_dni || !user_phone || !user_email || !user_password || !user_role) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }



    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const existingUser = await User.query().findOne({ user_email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    if (!canCreateRole(creator.user_role, user_role)) {
      return res
        .status(403)
        .json({ error: "No tenés permiso para crear este tipo de usuario" });
    }

    limiteOperadores = await companyController.getLimitOperator(company_id);
    limiteProfesionales = await companyController.getLimitProfesionales(
      company_id
    );

    currentTotalOperadores = await getCurrentTotalOperadores(company_id);
    currentTotalProfesionales = await getCurrentTotalProfesionales(company_id);

    if (user_role == "operador" && currentTotalOperadores >= limiteOperadores) {
      return res.status(400).json({ error: "Limite de operadores alcanzado" });
    }

    if (
      user_role == "profesional" &&
      currentTotalProfesionales >= limiteProfesionales
    ) {
      return res
        .status(400)
        .json({ error: "Limite de profesionales alcanzado" });
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

    /*LOGGER*/ await registrarNuevoLog(
      newUser.company_id,
      "El usuario " +
      newUser.user_complete_name +
      " ha sido creado" +
      ". (Ejecutado por " +
      req.user.user_name +
      ")."
    );

    return res
      .status(201)
      .json({ success: true, message: "Usuario creado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Editar usuario
// ---------------------------------------------------------
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
    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const user = await User.query()
      .findById(user_id)
      .where("company_id", company_id);
    if (!user)
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });

    const patchData = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        const val = req.body[field];
        if (!val || val.toString().trim() === "")
          return res
            .status(400)
            .json({ error: `El campo ${field} no puede estar vacío` });
        patchData[field] = val;
      }
    }

    if (
      patchData.user_role &&
      !canCreateRole(creator.user_role, patchData.user_role)
    ) {
      return res
        .status(403)
        .json({ error: "No tenés permiso para crear este tipo de usuario" });
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
      return res.status(400).json({ error: "Limite de operadores alcanzado" });
    }

    if (
      patchData.user_role == "profesional" &&
      currentTotalProfesionales >= limiteProfesionales
    ) {
      return res
        .status(400)
        .json({ error: "Limite de profesionales alcanzado" });
    }

    if (patchData.user_email) {
      const exists = await User.query()
        .where("user_email", patchData.user_email)
        .whereNot("user_id", user_id)
        .first();
      if (exists)
        return res.status(400).json({ error: "El email ya está registrado" });
    }

    if (patchData.user_dni) {
      const exists = await User.query()
        .where("user_dni", patchData.user_dni)
        .whereNot("user_id", user_id)
        .first();
      if (exists)
        return res.status(400).json({ error: "El DNI ya está registrado" });
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

    /*LOGGER*/ await registrarNuevoLog(
      user.company_id,
      "El usuario " +
      user.user_complete_name +
      " ha sido editado." +
      " (Ejecutado por " +
      creator.user_name +
      ")."
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario editado correctamente" });
  } catch (e) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Obtener todos lo suaurios
// ---------------------------------------------------------
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

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Bloquear usuario
// ---------------------------------------------------------
async function blockUserAsClient(req, res) {
  const companyId = req.user.company_id;
  const { user_id } = req.params;

  try {
    const userToBlock = await User.query()
      .findById(user_id)
      .where("company_id", companyId);

    if (!canManageAccess(req.user.user_role, userToBlock.user_role)) {
      return res
        .status(403)
        .json({ error: "No tenés permiso para gestionar este usuario" });
    }

    if (!userToBlock) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }

    if (userToBlock.user_id === req.user.user_id)
      return res
        .status(400)
        .json({ error: "No puedes bloquear tu propio usuario" });

    if (userToBlock.user_status === 0)
      return res.status(400).json({ error: "El usuario ya estaba bloqueado" });

    await bloquearUsuarioPorId(user_id);

    /*LOGGER*/ await registrarNuevoLog(
      userToBlock.company_id,
      "El usuario " +
      userToBlock.user_complete_name +
      " ha sido bloqueado." +
      ". (Ejecutado por " +
      req.user.user_name +
      ")."
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario bloqueado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Desbloquear usuario
// ---------------------------------------------------------
async function unblockUserAsClient(req, res) {
  const companyId = req.user.company_id;
  const { user_id } = req.params;

  try {
    const userToUnblock = await User.query()
      .findById(user_id)
      .where("company_id", companyId);

    if (!canManageAccess(req.user.user_role, userToUnblock.user_role)) {
      return res
        .status(403)
        .json({ error: "No tenés permiso para gestionar este usuario" });
    }

    if (!userToUnblock) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }

    if (userToUnblock.user_id === req.user.user_id)
      return res
        .status(400)
        .json({ error: "No puedes desbloquear tu propio usuario" });

    if (userToUnblock.user_status === 1)
      return res
        .status(400)
        .json({ error: "El usuario ya estaba desbloqueado" });

    await desbloquearUsuarioPorId(user_id);

    /*LOGGER*/ await registrarNuevoLog(
      userToUnblock.company_id,
      "El usuario " +
      userToUnblock.user_complete_name +
      " ha sido bloqueado." +
      ". (Ejecutado por " +
      req.user.user_name +
      ")."
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario desbloqueado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Restaurar usuario (post reseteo)
// ---------------------------------------------------------
async function restoreUserAsClient(req, res) {
  try {
    const companyId = req.user.company_id;
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res
        .status(400)
        .json({ error: "Debes ingresar una nueva contraseña" });
    }

    const userToRestore = await User.query()
      .findById(user_id)
      .where("company_id", companyId);
    if (!userToRestore) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }
    if (userToRestore.user_status === 1) {
      return res
        .status(400)
        .json({ error: "El usuario ya se encuentra habilitado" });
    }

    if (!canManageAccess(req.user.user_role, userToRestore.user_role)) {
      return res
        .status(403)
        .json({ error: "No tenés permiso para gestionar este usuario" });
    }

    await resetPassword(user_id, new_password);
    habilitarUsuarioPorId(user_id);

    await messageController.createMessageCustom({
      platform_message_title: "Cuenta habilitada",
      platform_message_content: "Hemos reestablecido tu cuenta con una contraseña provisoria. Te recomendamos cambiarla por una más segura desde la seccion de tu Perfil.",
      user_id: userToRestore.user_id,
      company_id: userToRestore.company_id,

    });

    /*LOGGER*/ await registrarNuevoLog(
      userToRestore.company_id,
      "El usuario " +
      userToRestore.user_complete_name +
      " ha sido desbloqueado y la contraseña ha sido reestablecida." +
      ". (Ejecutado por " +
      req.user.user_name +
      ")."
    );

    return res
      .status(200)
      .json({ success: true, message: "Usuario restaurado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// CONTROLADORES PARA PROFESIONAL
// ---------------------------------------------------------
// OBTENER ESTADO ACTUAL
// ---------------------------------------------------------
async function getWorkloadState(req, res) {
  const user_id = req.user.user_id;


  try {
    const userWorkloadState = await User.query().findById(user_id);


    return res.json(userWorkloadState.apto_recibir == 1 ? true : false);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// CONTROLADORES PARA PROFESIONAL
// ---------------------------------------------------------
// HABILITAR RECIBIR TRABAJO
// ---------------------------------------------------------
async function enableReceiveWork(req, res) {
  const user_id = req.user.user_id;

  try {
    const userAvailableWork = await User.query().findById(user_id);

    if (userAvailableWork.apto_recibir === 1) {
      return res.status(400).json({
        error: "El profesional ya estaba habilitado para recibir trabajos",
      });
    }

    await User.query().findById(user_id).patch({ apto_recibir: true });

    return res
      .status(200)
      .json({ success: true, message: "Recibir trabajo habilitado" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// DESHABILITAR RECIBIR TRABAJO
// ---------------------------------------------------------
async function disableReceiveWork(req, res) {
  const user_id = req.user.user_id;

  try {
    const userAvailableWork = await User.query().findById(user_id);

    if (userAvailableWork.apto_recibir === 0) {
      return res.status(400).json({
        error: "El profesional ya estaba deshabilitado para recibir trabajos",
      });
    }

    await User.query().findById(user_id).patch({ apto_recibir: false });

    return res
      .status(200)
      .json({ success: true, message: "Recibir trabajo deshabilitado" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
// Logicas para creacion de usuarios
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

// Obtener total de operadores actual por empresa
async function getCurrentTotalOperadores(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "operador" })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

// Obtener total de profesionales actual por empresa
async function getCurrentTotalProfesionales(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "profesional" })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

// ---------------------------------------------------------
// OTROS HELPERS
// ---------------------------------------------------------

// Funcion para bloquear un usuario
async function bloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, {
    user_status: false,
  });
}

async function desbloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, {
    user_status: true,
  });
}

// Funcion para activar un usuario
async function habilitarUsuarioPorId(user_id) {
  await userLogController.deleteLogByYserid(user_id);
  return await User.query().patchAndFetchById(user_id, {
    user_status: true,
  });
}

// ---------------------------------------------------------
// Reset passoword
// ---------------------------------------------------------
async function resetPassword(user_id, newPassword) {
  const passWordToUpdate = bcrypt.hashSync(newPassword, saltRounds);
  await User.query().findById(user_id).patch({
    user_password: passWordToUpdate,
  });
}

// ---------------------------------------------------------
// VISTAS
// ---------------------------------------------------------
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

async function getProfesionalesDetailAsClient(req, res) {
  try {
    const companyId = req.user.company_id;
    const data = await fetchProfesionalesDetail(companyId);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
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

  getWorkloadState,
  enableReceiveWork,
  disableReceiveWork,

  // metodos auxiliares
  bloquearUsuarioPorId,

  // VISTAS
  fetchProfesionalesDetail,
  getProfesionalesDetailAsClient,
};
