const redisClient = require("../helpers/redis");
const Joi = require("joi");

module.exports = async function checkToken(req, res, next) {
	const token = req.headers.token;

	const tokenIsValid = Joi.string().required().validate(token);

	if (!token || !tokenIsValid) {
		res.status(401).json({
			message: "Auth failed, token is required",
		});
		return;
	}

	try {
		const exists = await redisClient.exists(token);

		if (exists) {
			next();
		} else {
			res.status(401).json({
				message: "Unauthorized. A new token is required",
			});
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
