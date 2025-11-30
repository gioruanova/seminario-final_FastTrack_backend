const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../../models/User");

function hashPassword(password) {
  return bcrypt.hashSync(password, saltRounds);
}

async function blockUser(userId) {
  return await User.query().patchAndFetchById(userId, {
    user_status: false,
  });
}

async function unblockUser(userId) {
  return await User.query().patchAndFetchById(userId, {
    user_status: true,
  });
}

async function enableUser(userId) {
  return await User.query().patchAndFetchById(userId, {
    user_status: true,
  });
}

async function resetPassword(userId, newPassword) {
  const passwordHash = hashPassword(newPassword);
  await User.query().findById(userId).patch({
    user_password: passwordHash,
  });
}

module.exports = { hashPassword, blockUser, unblockUser, enableUser, resetPassword, };

