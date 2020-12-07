const redisClient = require("../helpers/redis");

module.exports = async function checkToken(req, res, next) {
	const voteValue = req.body.value;

	const vote =
		typeof voteValue === "number" || voteValue === "?" ? voteValue : 0;

	if (vote) {
		next();
	} else {
		res.status(403).json({
			message: "The vote is not valid",
		});
	}
};
