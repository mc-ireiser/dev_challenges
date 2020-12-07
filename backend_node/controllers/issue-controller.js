const redisClient = require("../helpers/redis");

// joinIssue
exports.joinIssue = async (req, res, next) => {
	const token = req.headers.token;
	const issueNumber = req.params.issue;

	const userName = await redisClient.get(token);
	const issueExist = await redisClient.exists(issueNumber);

	const newMember = {
		id: token,
		name: userName,
		status: "waiting",
		value: 0,
	};

	if (issueExist) {
		joinToExistingIssue(res, token, issueNumber, newMember);
	} else {
		joinToNewIssue(res, issueNumber, newMember);
	}
};

async function joinToExistingIssue(res, token, issueNumber, newMember) {
	const issueMembersString = await redisClient.hmget(issueNumber, "members");
	let issueMembers = await JSON.parse(issueMembersString);

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
}

async function joinToNewIssue(res, issueNumber, newMember) {
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
}

// getIssue
exports.getIssue = async (req, res, next) => {
	const issueNumber = req.params.issue;

	const issueArray = await redisClient.hmget(
		issueNumber,
		"status",
		"members",
		"avg"
	);

	const issueMembers = await JSON.parse(issueArray[1]);

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
};

// getAllIssue
exports.getAllIssue = async (req, res, next) => {
	const issues = await redisClient.lrange("index", 0, -1);

	res.json({
		issues,
	});
};

// voteIssue
exports.voteIssue = async (req, res, next) => {
	const token = req.headers.token;
	const issueNumber = req.params.issue;

	const issueArray = await redisClient.hmget(
		issueNumber,
		"status",
		"members",
		"avg"
	);

	const issueMembers = await JSON.parse(issueArray[1]);

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
