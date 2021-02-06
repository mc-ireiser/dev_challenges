const redisClient = require("../../helpers/redis");

module.exports = async function joinToExistingIssue(
	res,
	userName,
	issueNumber,
	newMember
) {
	try {
		const issueMembersString = await redisClient.hmget(issueNumber, "members");
		let issueMembers = JSON.parse(issueMembersString);
		let memberExist = issueMembers.some((element) => element.id === userName);

		if (memberExist) {
			return res.json({
				message: "The user was already attached to the issue",
			});
		}

		issueMembers.push(newMember);

		const result = await redisClient.hmset(
			issueNumber,
			"status",
			"voting",
			"members",
			JSON.stringify(issueMembers)
		);

		return res.json({
			issueMembers,
			message: result === "OK" ? "Joined the issue successfully" : result,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
