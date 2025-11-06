// -----------------
// CONTROLADOR DE BANNERS DEL SITIO
// -----------------

const SiteBanner = require("../models/Banner");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida } = require("../helpers/responseHelpers");
const { obtenerPorId } = require("../helpers/registroHelpers");

// -----------------
// OBTENER TODOS LOS BANNERS (ADMIN)
// -----------------
async function getBannersAsAdmin(req, res) {
  try {
    const banners = await SiteBanner.query().select();
    return enviarLista(res, banners);
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// EDITAR UN BANNER
// -----------------
async function editBanner(req, res) {
  const bannerId = req.params.banner_id;
  const { banner_text, banner_limit } = req.body;

  // Verifica que venga al menos uno de los dos campos
  if (!banner_text && !banner_limit) {
    return enviarSolicitudInvalida(res, "Debes enviar al menos el texto del banner o la fecha límite");
  }

  try {
    const bannerExist = await obtenerPorId(SiteBanner, bannerId);
    if (!bannerExist) {
      return enviarNoEncontrado(res, "Banner");
    }

    const updateData = {};

    if (banner_text) {
      updateData.banner_text = banner_text;
    }

    if (banner_limit) {
      const limitDate = new Date(banner_limit);
      if (isNaN(limitDate.getTime())) {
        return enviarSolicitudInvalida(res, "La fecha límite no tiene un formato válido");
      }

      if (limitDate < new Date()) {
        return enviarSolicitudInvalida(res, "La fecha límite no puede ser en el pasado");
      }

      updateData.banner_limit = limitDate;
    }

    await SiteBanner.query().findById(bannerId).patch(updateData);

    return enviarExito(res, "Banner actualizado correctamente");
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// OBTENER BANNER ACTIVO (PARA CUALQUIER USUARIO)
// -----------------
async function getActiveBanner(req, res) {
  try {
    const banners = await SiteBanner.query()
      .select()
      .where("banner_active", true);

    if (!banners.length) {
      return enviarNoEncontrado(res, "Banner");
    }

    return enviarLista(res, banners);
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ELIMINAR BANNER
// -----------------
async function deleteBanner(req, res) {
  const bannerId = req.params.banner_id;
  try {
    const bannerExist = await obtenerPorId(SiteBanner, bannerId);
    if (!bannerExist) {
      return enviarNoEncontrado(res, "Banner");
    }

    await SiteBanner.query().deleteById(bannerId);

    return enviarExito(res, "Banner eliminado correctamente");
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CREAR BANNER
// -----------------
async function createBanner(req, res) {
  const { banner_text, banner_limit } = req.body;

  if (!banner_text || !banner_limit) {
    return enviarSolicitudInvalida(res, "El banner y la fecha limite son requeridos");
  }

  if (banner_limit < new Date()) {
    return enviarSolicitudInvalida(res, "La fecha limite no puede ser en el pasado");
  }

  try {
    await SiteBanner.query().insert({
      banner_text,
      banner_limit,
      banner_active: false,
    });

    return enviarExito(res, "Banner creado correctamente");
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTIVAR BANNER
// -----------------
async function enableBanner(req, res) {
  const bannerId = req.params.banner_id;

  try {
    const bannerExist = await obtenerPorId(SiteBanner, bannerId);
    if (!bannerExist) {
      return enviarNoEncontrado(res, "Banner");
    }

    if (bannerExist.banner_active === 1) {
      return enviarSolicitudInvalida(res, "El banner ya está activado");
    }

    const banners = await SiteBanner.query()
      .where("banner_active", true)
      .count("baner_id as total");

    const activeCount = parseInt(banners[0].total, 10);

    if (activeCount >= 1) {
      return enviarSolicitudInvalida(res, "Solo puede haber un banner activo a la vez");
    }

    await SiteBanner.query().findById(bannerId).patch({ banner_active: true });

    return enviarExito(res, "Banner activado correctamente");
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESACTIVAR BANNER
// -----------------
async function disableBanner(req, res) {
  const bannerId = req.params.banner_id;

  try {
    const bannerExist = await obtenerPorId(SiteBanner, bannerId);
    if (!bannerExist) {
      return enviarNoEncontrado(res, "Banner");
    }

    if (bannerExist.banner_active === 0) {
      return enviarSolicitudInvalida(res, "El banner ya está desactivado");
    }

    await SiteBanner.query().findById(bannerId).patch({ banner_active: false });

    return enviarExito(res, "Banner desactivado correctamente");
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

module.exports = {
  getBannersAsAdmin,
  createBanner,
  editBanner,
  enableBanner,
  disableBanner,
  deleteBanner,

  getActiveBanner,
};
