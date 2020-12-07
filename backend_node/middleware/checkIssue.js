const redisClient = require("../helpers/redis");

module.exports = async function checkToken(req, res, next) {
	const issueNumber = req.params.issue;
	const issueExist = await redisClient.exists(issueNumber);

	if (issueExist) {
		next();
	} else {
		res.status(404).json({
			message: "The requested issue does not exist",
		});
	}
};
