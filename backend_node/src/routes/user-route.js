const express = require("express");
const router = express.Router();

// Controller
const UserController = require("../controllers/user-controller");

// Routes
router.post("", UserController.createUser);
router.post("/login", UserController.loginUser);

// Exports
module.exports = router;
