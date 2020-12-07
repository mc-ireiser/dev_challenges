const redisClient = require("../helpers/redis");

module.exports = async function checkToken(req, res, next) {
	const token = req.headers.token;

	if (!token) {
		res.status(401).json({
			message: "Auth failed, token is required",
		});
		return;
	}

	const exists = await redisClient.exists(token);

	if (exists) {
		next();
	} else {
		res.status(401).json({
			message: "Unauthorized. A new token is required",
		});
	}
};
