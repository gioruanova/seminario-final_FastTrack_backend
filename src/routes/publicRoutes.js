const express = require("express");
const router = express.Router();
const publicMessagesController = require("../controllers/cfv/publicMessagesController");
const publicMessageCategoryController = require("../controllers/cfv/publicMessageCategoryController");
const authUserController = require("../controllers/authUserController");

router.post("/messages", publicMessagesController.createPublicMessage);
router.get(
  "/messageCategories",
  publicMessageCategoryController.getAllMessagesCategoriesAsPublic
);

router.post("/login", authUserController.login);
router.get("/refresh", authUserController.refreshToken);
router.get("/profile", authUserController.getProfile);
router.get("/logout", authUserController.logout);

module.exports = router;
