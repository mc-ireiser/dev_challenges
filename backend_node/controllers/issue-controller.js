const redisClient = require("../helpers/redis");
const Joi = require("joi");

// joinIssue
exports.joinIssue = async (req, res, next) => {
	const issueNumber = req.params.issue;
	const userName = req.headers.username;

	try {
		const name = await redisClient.get(userName);

		if (!name) {
			return res.status(400).json({
				message: "Username not found",
			});
		}

		const newMember = {
			id: userName,
			name: name,
			status: "waiting",
			value: 0,
		};

		const issueExist = await redisClient.exists(issueNumber);

		if (issueExist) {
			const joinToExistingIssue = require("./issue-controller-utils/joinToExistingIssue");
			joinToExistingIssue(res, userName, issueNumber, newMember);
		} else {
			const joinToNewIssue = require("./issue-controller-utils/joinToNewIssue");
			joinToNewIssue(res, issueNumber, newMember);
		}
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

// getAllIssue
exports.getAllIssue = async (req, res, next) => {
	try {
		const issues = await redisClient.lrange("index", 0, -1);
		return res.json({
			issues,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

// getIssue
exports.getIssue = async (req, res, next) => {
	const issueNumber = req.params.issue;

	try {
		const issueArray = await redisClient.hmget(
			issueNumber,
			"status",
			"members",
			"avg"
		);

		const issueMembers = JSON.parse(issueArray[1]);
		const isVoted = issueMembers.every((element) =>
			["voted", "passed"].includes(element.status)
		);

		let issue = {};

		if (isVoted) {
			issue = {
				status: issueArray[0],
				avg: issueArray[2],
				members: issueMembers,
			};
		} else {
			let members = [];

			issueMembers.forEach((element) => {
				let { id, name, status } = element;
				members.push({ id, name, status });
			});

			issue = {
				status: issueArray[0],
				members,
			};
		}

		return res.json({
			issue,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

// voteIssue
exports.voteIssue = async (req, res, next) => {
	const userName = req.headers.username;
	const issueNumber = req.params.issue;

	try {
		const issueArray = await redisClient.hmget(
			issueNumber,
			"status",
			"members",
			"avg"
		);

		const issueMembers = JSON.parse(issueArray[1]);
		const isVoted = issueMembers.every((element) =>
			["voted", "passed"].includes(element.status)
		);

		if (isVoted) {
			return res.status(200).json({
				message: "The issue has already been voted",
			});
		}

		const issueIsNotVoted = require("./issue-controller-utils/issueIsNotVoted");
		issueIsNotVoted(req, res, userName, issueNumber, issueArray, issueMembers);
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
