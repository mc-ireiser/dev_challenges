const express = require("express");
const router = express.Router();

// Routes
router.get("", (req, res) => {
	return res.json({
		descripcion: "Workana dev_challenges",
		autor: "Jesús Rodríguez",
	});
});

// Exports
module.exports = router;
