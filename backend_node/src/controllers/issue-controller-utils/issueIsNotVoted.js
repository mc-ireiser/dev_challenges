const redisClient = require("../../helpers/redis");

module.exports = async function issueIsNotVoted(
	req,
	res,
	userName,
	issueNumber,
	issueArray,
	issueMembers
) {
	const voteValue = req.body.value;
	const votePassed = voteValue === "?" ? true : false;
	let member = issueMembers.filter((element) => element.id === userName)[0];

	if (!member) {
		return res.status(404).json({
			message: "The user is not joined to this issue",
		});
	}

	if (["passed", "voted"].includes(member.status)) {
		return res.status(404).json({
			message: "The user already voted on this issue",
		});
	}

	member.status = votePassed ? "passed" : "voted";
	member.value = typeof voteValue === "number" ? voteValue : 0;

	let avgSum = 0;
	let membersVoteCount = 0;

	issueMembers.forEach((element) => {
		if (element.status === "voted") {
			avgSum += element.value;
			membersVoteCount++;
		}
	});

	try {
		issueArray[1] = JSON.stringify(issueMembers);

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

		return res.json({
			message: result === "OK" ? "The vote was counted" : result,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
