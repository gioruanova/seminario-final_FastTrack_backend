// -----------------
// CONTROLADOR DE CATEGORÍAS DE MENSAJES PÚBLICOS
// -----------------
const PublicMessageCategory = require("../../models/cfv/PublicMessageCategory");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida, enviarConflicto } = require("../../helpers/responseHelpers");
const { obtenerPorId } = require("../../helpers/registroHelpers");

// -----------------
// CONTROLADORES ADMIN:
// -----------------

// -----------------
// OBTENER TODAS LAS CATEGORÍAS DE MENSAJES
// -----------------
async function getAllMessagesCategoriesAsAdmin(req, res) {
  try {
    const categories = await PublicMessageCategory.query()
      .where("category_status", true)
      .select("*");
    return enviarLista(res, categories);
  } catch (error) {
    return enviarError(res, "Error al obtener las categorias", 500);
  }
}

// -----------------
// OBTENER TODAS LAS CATEGORÍAS DE MENSAJES (PÚBLICO)
// -----------------
async function getAllMessagesCategoriesAsPublic(req, res) {
  try {
    const categories = await PublicMessageCategory.query()
      .select("*")
      .where("category_status", true);
    return enviarLista(res, categories);
  } catch (error) {
    return enviarError(res, "Error al obtener las categorias", 500);
  }
}

// -----------------
// CREAR NUEVA CATEGORÍA DE MENSAJES
// -----------------
async function createMessageCategoryAsAdmin(req, res) {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return enviarSolicitudInvalida(res, "category_name es requerido");
    }

    const validateCategory = await PublicMessageCategory.query()
      .select("*")
      .where({ category_name });

    if (validateCategory.length > 0) {
      return enviarConflicto(res, "La categoria ya existe");
    }

    const newCategory = await PublicMessageCategory.query().insert({
      category_name,
    });
    return res.status(200).json(newCategory);
  } catch (error) {
    return enviarError(res, "Error al crear la categoria", 500);
  }
}

// -----------------
// EDITAR CATEGORÍA DE MENSAJES
// -----------------
async function updateMessageCategoryAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const { category_name } = req.body;

    const categoriaActual = await obtenerPorId(PublicMessageCategory, category_id);

    if (!categoriaActual) {
      return enviarNoEncontrado(res, "Categoría");
    }

    if (categoriaActual.category_name === category_name) {
      return enviarSolicitudInvalida(res, "El nombre de categoría es el mismo.");
    }

    const categoriaDuplicada = await PublicMessageCategory.query()
      .where("category_name", category_name)
      .whereNot("category_id", category_id)
      .first();

    if (categoriaDuplicada) {
      return enviarConflicto(res, "La categoría ya existe.");
    }

    await PublicMessageCategory.query()
      .patch({ category_name })
      .where({ category_id });

    return enviarExito(res, "Categoría editada correctamente.");
  } catch (error) {
    return enviarError(res, "Error al editar la categoría", 500);
  }
}

// -----------------
// DESACTIVAR CATEGORÍA
// -----------------
async function disableMessageCategoryAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const category = await obtenerPorId(PublicMessageCategory, category_id);

    if (!category) {
      return enviarNoEncontrado(res, "Categoría");
    }

    if (category.category_status === 0) {
      return enviarSolicitudInvalida(res, "La categoría ya esta desactivada.");
    }

    await PublicMessageCategory.query()
      .patch({ category_status: false })
      .where({ category_id });

    return enviarExito(res, "Categoría desactivada correctamente.");
  } catch (error) {
    return enviarError(res, "Error al desactivar la categoría", 500);
  }
}

// -----------------
// REACTIVAR CATEGORÍA
// -----------------
async function enableMessageCategoryAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const category = await obtenerPorId(PublicMessageCategory, category_id);

    if (!category) {
      return enviarNoEncontrado(res, "Categoría");
    }

    if (category.category_status === 1) {
      return enviarSolicitudInvalida(res, "La categoría ya estaba activada.");
    }

    await PublicMessageCategory.query()
      .patch({ category_status: true })
      .where({ category_id });

    return enviarExito(res, "Categoría reactivada correctamente.");
  } catch (error) {
    return enviarError(res, "Error al reactivar la categoría", 500);
  }
}

// -----------------
// ELIMINAR CATEGORÍA
// -----------------
async function deleteCategoryMessageAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const category = await obtenerPorId(PublicMessageCategory, category_id);

    if (!category) {
      return enviarNoEncontrado(res, "Categoría");
    }

    await PublicMessageCategory.query().deleteById(category_id);

    return enviarExito(res, "Categoría eliminada correctamente.");
  } catch (error) {
    return enviarError(res, "Error al eliminar la categoría", 500);
  }
}

module.exports = {
  getAllMessagesCategoriesAsAdmin,
  getAllMessagesCategoriesAsPublic,
  createMessageCategoryAsAdmin,
  updateMessageCategoryAsAdmin,
  disableMessageCategoryAsAdmin,
  enableMessageCategoryAsAdmin,
  deleteCategoryMessageAsAdmin
};
