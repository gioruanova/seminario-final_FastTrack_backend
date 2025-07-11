const jwt = require("jsonwebtoken");

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
} = process.env;

// Genera accessToken y refreshToken para el payload recibido
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });

  return { accessToken, refreshToken };
}

// Recibe refreshToken, verifica y genera un nuevo accessToken con payload limpio
function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Armar un payload nuevo manualmente para mayor seguridad y evitar repeticiones raras
    const payload = {
      // Definir acá los campos que consideramos seguros para el accessToken
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      company_id: decoded.company_id, // puede ser undefined en superadmin
    };

    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });
  } catch {
    return null;
  }
}

module.exports = {
  generateTokens,
  refreshAccessToken,
};
