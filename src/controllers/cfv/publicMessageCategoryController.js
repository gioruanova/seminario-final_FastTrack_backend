const PublicMessageCategory = require("../../models/cfv/PublicMessageCategory");

// CONTROLADORES ADMIN:
// ---------------------------------------------------------
// Ver todas las categorias de mensajes
// ---------------------------------------------------------
async function getAllMessagesCategoriesAsAdmin(req, res) {
  try {
    const categories = await PublicMessageCategory.query().where("category_status", true).select("*");
    return res.json(categories);
  } catch (error) {
     
    return res.status(500).json({ error: "Error al obtener las categorias" });
  }
}

async function getAllMessagesCategoriesAsPublic(req, res) {
  try {
    const categories = await PublicMessageCategory.query().select("*");
    return res.json(categories);
  } catch (error) {
     
    return res.status(500).json({ error: "Error al obtener las categorias" });
  }
}

// ---------------------------------------------------------
// Crear nueva categoria de mensajes
// ---------------------------------------------------------
async function createMessageCategoryAsAdmin(req, res) {
  try {
    const { category_name } = req.body;

    const validateCategory = await PublicMessageCategory.query()
      .select("*")
      .where({ category_name });

    if (validateCategory.length > 0) {
      return res.status(400).json({ error: "La categoria ya existe" });
    }

    const newCategory = await PublicMessageCategory.query().insert({
      category_name,
    });
    return res.status(200).json(newCategory);
  } catch (error) {
     
    return res.status(500).json({ error: "Error al crear la categoria" });
  }
}

// ---------------------------------------------------------
// Editar categoria de mensajes
// ---------------------------------------------------------
async function updateMessageCategoryAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const { category_name } = req.body;

    const categoriaActual = await PublicMessageCategory.query().findById(
      category_id
    );

    if (!categoriaActual) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (categoriaActual.category_name === category_name) {
      return res
        .status(400)
        .json({ error: "El nombre de categoría es el mismo." });
    }

    const categoriaDuplicada = await PublicMessageCategory.query()
      .where("category_name", category_name)
      .whereNot("category_id", category_id)
      .first();

    if (categoriaDuplicada) {
      return res.status(400).json({ error: "La categoría ya existe." });
    }

    await PublicMessageCategory.query()
      .patch({ category_name })
      .where({ category_id });

    return res
      .status(200)
      .json({ success: true, message: "Categoría editada correctamente." });
  } catch (error) {
     
    return res.status(500).json({ error: "Error al editar la categoría" });
  }
}

// ---------------------------------------------------------
// Desactivar una categoria
// ---------------------------------------------------------
async function disableMessageCategoryAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const category = await PublicMessageCategory.query().findById(category_id);
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });

    }
    if (category.category_status === 0)
      return res
        .status(400)
        .json({ error: "La categoría ya esta desactivada." });

    await PublicMessageCategory.query()
      .patch({ category_status: false })
      .where({
        category_id,
      });
    return res
      .status(200)
      .json({ success: true, message: "Categoría desactivada correctamente." });
  } catch (error) {
     
    return res.status(500).json({ error: "Error al desactivar la categoría" });
  }
}

// ---------------------------------------------------------
// Reactivar una categoria
// ---------------------------------------------------------
async function enableMessageCategoryAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const category = await PublicMessageCategory.query().findById(category_id);
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    if (category.category_status === 1)
      return res
        .status(400)
        .json({ error: "La categoría ya estaba activada." });

    await PublicMessageCategory.query()
      .patch({ category_status: true })
      .where({
        category_id,
      });

    return res
      .status(200)
      .json({ success: true, message: "Categoría reactivada correctamente." });
  } catch (error) {
     
    return res.status(500).json({ error: "Error al reactivar la categoría" });
  }
}

// ---------------------------------------------------------
// Borrar una categoria
// ---------------------------------------------------------
async function deleteCategoryMessageAsAdmin(req, res) {
  try {
    const { category_id } = req.params;
    const category = await PublicMessageCategory.query().findById(category_id);
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    await PublicMessageCategory.query().deleteById(category_id);
    return res
      .status(200)
      .json({ success: true, message: "Categoría eliminada correctamente." });
  } catch (error) {
     
    return res.status(500).json({ error: "Error al eliminar la categoría" });
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
