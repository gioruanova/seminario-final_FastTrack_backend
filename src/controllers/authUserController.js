const jwt = require("jsonwebtoken");
const { loginUser, refreshUserToken } = require("../services/authUserService");
const User = require("../models/User");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y password son requeridos" });

    const result = await loginUser(email, password);
    if (!result)
      return res.status(401).json({ error: "Credenciales inválidas" });

    if (result.error === "blocked") {
      return res.status(403).json({ error: "Contacte a su administrador" });
    }

    // envioo tokens en cookies HTTP-only
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_EXPIRATION), // 30m
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_REFRESH_EXPIRATION), // 7d
    });

    // tomo  userData y devuelvo solo info pública
    const { accessToken, refreshToken, ...userData } = result;

    return res.json({
      ...userData,
      status: 200,
      success: true,
      message: "Login exitoso",
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

function refreshToken(req, res) {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie)
      return res.status(400).json({ error: "Refresh token es requerido" });

    const tokenObject = refreshUserToken(tokenFromCookie);
    if (!tokenObject || !tokenObject.accessToken)
      return res
        .status(401)
        .json({ error: "Refresh token inválido o expirado" });

    // actualizo cookie
    res.cookie("accessToken", tokenObject.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: ms(process.env.JWT_EXPIRATION), // 30m
    });

    return res.json({
      success: true,
      message: "Refresh token actualizado",
      status: 200,
    }); // sin token
  } catch {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getProfile(req, res) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.query().findById(decoded.user_id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let company = null;
    if (user.user_role !== "superadmin") {
      company = await user.$relatedQuery("company").first();
    }

    if (user.user_role == "superadmin") {
      return res.json({
        user_id: user.user_id,
        user_email: user.user_email,
        user_name: user.user_complete_name,
        user_role: user.user_role,
      });
    } else {
      return res.json({
        user_id: user.user_id,
        user_email: user.user_email,
        user_name: user.user_complete_name,
        user_role: user.user_role,
        company_id: company.company_id || null,
        company_name: company.company_nombre || null,
        company_status: company.company_estado || null,
      });
    }
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// POST /logout
function logout(req, res) {
  // Borrar cookies HTTP-only
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.json({ success: true, message: "Logout exitoso" });
}

module.exports = { login, refreshToken, logout, getProfile };
