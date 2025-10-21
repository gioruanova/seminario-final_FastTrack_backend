const SiteBanner = require("../models/Banner");

// get banner
async function getBannersAsAdmin(req, res) {
  try {
    const banners = await SiteBanner.query().select();

    return res.json(banners);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// editar un banner
async function editBanner(req, res) {
  const bannerId = req.params.banner_id;
  const { banner_text, banner_limit } = req.body;

  // Verifica que venga al menos uno de los dos campos
  if (!banner_text && !banner_limit) {
    return res
      .status(400)
      .json({ error: "Debes enviar al menos el texto del banner o la fecha límite" });
  }

  try {
    const bannerExist = await SiteBanner.query().findById(bannerId);
    if (!bannerExist) {
      return res.status(404).json({ error: "El banner no existe" });
    }

    const updateData = {};

    if (banner_text) {
      updateData.banner_text = banner_text;
    }

    if (banner_limit) {
      const limitDate = new Date(banner_limit);
      if (isNaN(limitDate.getTime())) {
        return res
          .status(400)
          .json({ error: "La fecha límite no tiene un formato válido" });
      }

      if (limitDate < new Date()) {
        return res
          .status(400)
          .json({ error: "La fecha límite no puede ser en el pasado" });
      }

      updateData.banner_limit = limitDate;
    }

    await SiteBanner.query().findById(bannerId).patch(updateData);

    return res.json({
      success: true,
      message: "Banner actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}


// get active banner (for any user)
async function getActiveBanner(req, res) {
  try {
    const banners = await SiteBanner.query()
      .select()
      .where("banner_active", true);


    if (!banners.length) {
      return res.status(404).json({ error: "No hay banners" });
    }

    return res.json(banners);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function deleteBanner(req, res) {
  const bannerId = req.params.banner_id;
  try {
    const bannerExist = await SiteBanner.query().findById(bannerId);
    if (!bannerExist) {
      return res.status(404).json({ error: "El banner no existe" });
    }

    await SiteBanner.query().deleteById(bannerId);

    return res.json({
      success: true,
      message: "Banner eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// create banner
async function createBanner(req, res) {
  const { banner_text, banner_limit } = req.body;

  if (!banner_text || !banner_limit) {
    return res
      .status(400)
      .json({ error: "El banner y la fecha limite son requeridos" });
  }

  if (banner_limit < new Date()) {
    return res
      .status(400)
      .json({ error: "La fecha limite no puede ser en el pasado" });
  }

  try {
    await SiteBanner.query().insert({
      banner_text,
      banner_limit,
      banner_active: false,
    });

    return res.json({ success: true, message: "Banner creado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// enable banner
async function enableBanner(req, res) {
  const bannerId = req.params.banner_id;

  try {
    const bannerExist = await SiteBanner.query().findById(bannerId);
    if (!bannerExist) {
      return res.status(404).json({ error: "El banner no existe" });
    }

    if (bannerExist.banner_active === 1) {
      return res.status(400).json({ error: "El banner ya está activado" });
    }

    const banners = await SiteBanner.query()
      .where("banner_active", true)
      .count("baner_id as total");

    const activeCount = parseInt(banners[0].total, 10);

    if (activeCount >= 1) {
      return res
        .status(400)
        .json({ error: "Solo puede haber un banner activo a la vez" });
    }

    await SiteBanner.query().findById(bannerId).patch({ banner_active: true });

    return res.json({ message: "Banner activado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// disable banner
async function disableBanner(req, res) {
  const bannerId = req.params.banner_id;

  try {
    const bannerExist = await SiteBanner.query().findById(bannerId);
    if (!bannerExist) {
      return res.status(404).json({ error: "El banner no existe" });
    }

    if (bannerExist.banner_active === 0) {
      return res.status(400).json({ error: "El banner ya está desactivado" });
    }

    await SiteBanner.query().findById(bannerId).patch({ banner_active: false });

    return res.json({ message: "Banner desactivado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
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
