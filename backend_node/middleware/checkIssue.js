const redisClient = require("../helpers/redis");
const Joi = require("joi");

module.exports = async function checkIssue(req, res, next) {
	const issueNumber = req.params.issue;
	const issueNumberIsValid = Joi.string().required().validate(issueNumber);

	if (!issueNumber || !issueNumberIsValid) {
		res.status(400).json({
			message: "Issue number is required",
		});
		return;
	}

	try {
		const issueExist = await redisClient.exists(issueNumber);

		if (issueExist) {
			next();
		} else {
			res.status(404).json({
				message: "The requested issue does not exist",
			});
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
