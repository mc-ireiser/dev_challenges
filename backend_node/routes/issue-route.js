const express = require("express");
const router = express.Router();

// middleware
const checkUserName = require("../middleware/checkUserName");
const checkIssue = require("../middleware/checkIssue");
const checkVote = require("../middleware/checkVote");

// Controller
const IssueController = require("../controllers/issue-controller");

// Routes
router.get("/all", IssueController.getAllIssue);
router.get("/:issue", checkIssue, IssueController.getIssue);
router.post("/:issue/join", checkUserName, IssueController.joinIssue);
router.post(
	"/:issue/vote",
	checkIssue,
	checkUserName,
	checkVote,
	IssueController.voteIssue
);

// Exports
module.exports = router;
