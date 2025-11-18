const jwt = require("jsonwebtoken");

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
} = process.env;

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });

  return { accessToken, refreshToken };
}

function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const payload = {
      user_id: decoded.user_id,
      user_email: decoded.email,
      user_role: decoded.user_role,
      company_id: decoded.company_id,
      company_name: decoded.company_name,
      user_name: decoded.user_name,
      
    };

    // Nuevo accessToken
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    // Nuevo refreshToken si se rota
    const newRefreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRATION,
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    return null;
  }
}


module.exports = {
  generateTokens,
  refreshAccessToken,
};
