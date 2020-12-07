const express = require("express");
const router = express.Router();

// middleware
const checkToken = require("../middleware/checkToken");
const checkIssue = require("../middleware/checkIssue");
const checkVote = require("../middleware/checkVote");

// Controller
const IssueController = require("../controllers/issue-controller");

// Routes
router.get("/all", IssueController.getAllIssue);
router.get("/:issue", checkIssue, IssueController.getIssue);
router.post("/:issue/join", checkToken, IssueController.joinIssue);
router.post(
	"/:issue/vote",
	checkToken,
	checkVote,
	checkIssue,
	IssueController.voteIssue
);

// Exports
module.exports = router;
