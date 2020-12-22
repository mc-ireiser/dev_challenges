const redisClient = require("../helpers/redis");
const Joi = require("joi");

// joinIssue
exports.joinIssue = async (req, res, next) => {
	const token = req.headers.token;
	const issueNumber = req.params.issue;

	try {
		const userName = await redisClient.get(token);

		if (!userName) {
			return res.status(400).json({
				message: "Username not found",
			});
		}

		const newMember = {
			id: token,
			name: userName,
			status: "waiting",
			value: 0,
		};

		const issueExist = await redisClient.exists(issueNumber);

		if (issueExist) {
			joinToExistingIssue(res, token, issueNumber, newMember);
		} else {
			joinToNewIssue(res, issueNumber, newMember);
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

async function joinToExistingIssue(res, token, issueNumber, newMember) {
	try {
		const issueMembersString = await redisClient.hmget(issueNumber, "members");
		let issueMembers = JSON.parse(issueMembersString);

		let memberExist = issueMembers.some((element) => element.id === token);

		if (memberExist) {
			res.json({
				message: "The user was already attached to the issue",
			});
		} else {
			issueMembers.push(newMember);

			const result = await redisClient.hmset(
				issueNumber,
				"status",
				"voting",
				"members",
				JSON.stringify(issueMembers)
			);

			res.json({
				issueMembers,
				message: result === "OK" ? "Joined the issue successfully" : result,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
}

async function joinToNewIssue(res, issueNumber, newMember) {
	try {
		const members = await JSON.stringify([newMember]);
		const result = await redisClient.hmset(
			issueNumber,
			"status",
			"voting",
			"members",
			members,
			"avg",
			0
		);

		redisClient.rpush("index", issueNumber);

		res.json({
			message: result === "OK" ? "A new issue was created" : result,
		});
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
}

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

		res.json({
			issue,
		});
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

// getAllIssue
exports.getAllIssue = async (req, res, next) => {
	try {
		const issues = await redisClient.lrange("index", 0, -1);
		res.json({
			issues,
		});
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

// voteIssue
exports.voteIssue = async (req, res, next) => {
	const token = req.headers.token;
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
			res.status(200).json({
				message: "The issue has already been voted",
			});
			return;
		} else {
			issueIsNotVoted(req, res, token, issueNumber, issueArray, issueMembers);
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

async function issueIsNotVoted(
	req,
	res,
	token,
	issueNumber,
	issueArray,
	issueMembers
) {
	const voteValue = req.body.value;
	const pass = voteValue === "?" ? true : false;

	let member = issueMembers.filter((element) => element.id === token)[0];

	if (member) {
		if (member.status === "waiting") {
			member.status = pass ? "passed" : "voted";
			member.value = typeof voteValue === "number" ? voteValue : 0;

			let avgSum = 0;
			let membersVoteCount = 0;
			issueMembers.forEach((element) => {
				if (["voted"].includes(element.status)) {
					avgSum += element.value;
					membersVoteCount++;
				}
			});

			try {
				issueArray[1] = await JSON.stringify(issueMembers);

				let status = issueMembers.every((element) =>
					["voted", "passed"].includes(element.status)
				);

				const result = await redisClient.hmset(
					issueNumber,
					"status",
					status ? "reveal" : "voting",
					"members",
					issueArray[1],
					"avg",
					avgSum / membersVoteCount
				);

				res.json({
					message: result === "OK" ? "The vote was counted" : result,
				});
			} catch (error) {
				res.status(500).json({
					message: `Server error ${error}`,
				});
			}
		} else {
			res.status(404).json({
				message: "The user already voted on this issue",
			});
		}
	} else {
		res.status(404).json({
			message: "The user is not joined to this issue",
		});
	}
}
