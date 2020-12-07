const express = require("express");
const router = express.Router();

// Controller
const ResetController = require("../controllers/reset-controller");

// Routes
router.get("", ResetController.resetdb);

// Exports
module.exports = router;
