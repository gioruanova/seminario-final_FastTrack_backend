const bcrypt = require("bcrypt");
const User = require("../models/Users");
const { generateTokens, refreshAccessToken } = require("./tokenService");

async function loginUser(email, password) {
  const user = await User.query().findOne({
    user_email: email,
    user_status: true,
  });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.user_password);
  if (!valid) return null;

  const payload = {
    user_id: user.user_id,
    email: user.user_email,
    role: user.user_role,
    company_id: user.company_id,
  };

  const { accessToken, refreshToken } = generateTokens(payload);

  return {
    
      email: user.user_email,
      role: user.user_role,
      company_id: user.company_id,
    
    accessToken,
    refreshToken,
  };
}

function refreshUserToken(refreshToken) {
  try {
    const decoded = refreshAccessToken(refreshToken);
    return decoded; // devuelve nuevo accessToken o null
  } catch {
    return null;
  }
}

module.exports = { loginUser, refreshUserToken };
