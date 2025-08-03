const bcrypt = require("bcrypt");
const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD_HASH, SUPERADMIN_NAME } =
  process.env;

const { generateTokens, refreshAccessToken } = require("./tokenService");

async function loginAdmin(user_email, password) {
  if (user_email !== SUPERADMIN_EMAIL) return null;

  const valid = await bcrypt.compare(password, SUPERADMIN_PASSWORD_HASH);
  if (!valid) return null;

  const payload = {
    user_email,
    user_name: SUPERADMIN_NAME,
    user_role: "superadmin",
  };

  const tokens = generateTokens(payload);

  return {
    ...tokens,
    user_email: payload.user_email,
    user_name: payload.user_name,
    user_role: payload.user_role,
  };
}

function refreshAdminToken(refreshToken) {
  return refreshAccessToken(refreshToken);
}

module.exports = {
  loginAdmin,
  refreshAdminToken,
};
