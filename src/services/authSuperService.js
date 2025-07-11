const bcrypt = require("bcrypt");
const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD_HASH, SUPERADMIN_NAME } =
  process.env;

const { generateTokens, refreshAccessToken } = require("./tokenService");

async function loginAdmin(email, password) {
  if (email !== SUPERADMIN_EMAIL) return null;

  const valid = await bcrypt.compare(password, SUPERADMIN_PASSWORD_HASH);
  if (!valid) return null;

  const payload = {
    email,
    name: SUPERADMIN_NAME,
    role: "superadmin",
  };

  const tokens = generateTokens(payload);

  // Devuelvo tokens + info para el front
  return {
    ...tokens,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

function refreshAdminToken(refreshToken) {
  return refreshAccessToken(refreshToken);
}

module.exports = {
  loginAdmin,
  refreshAdminToken,
};
