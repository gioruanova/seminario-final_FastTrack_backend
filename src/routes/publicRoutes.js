const express = require("express");
const router = express.Router();
const publicMessagesController = require("../controllers/cfv/publicMessagesController");
const publicMessageCategoryController = require("../controllers/cfv/publicMessageCategoryController");

router.post("/messages", publicMessagesController.createPublicMessage);
router.get("/messageCategories", publicMessageCategoryController.getAllMessagesCategoriesAsPublic);

module.exports = router;
