const redisClient = require("../../helpers/redis");

module.exports = async function joinToNewIssue(res, issueNumber, newMember) {
	try {
		const members = JSON.stringify([newMember]);

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

		return res.json({
			message: result === "OK" ? "A new issue was created" : result,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
