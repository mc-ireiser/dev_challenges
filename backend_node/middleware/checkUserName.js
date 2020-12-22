const redisClient = require("../helpers/redis");
const Joi = require("joi");

module.exports = async function checkuserName(req, res, next) {
	const userName = req.headers.username;

	console.log(req.headers);

	const userNameIsValid = Joi.string().required().validate(userName);

	if (!userNameIsValid) {
		res.status(401).json({
			message: "Auth failed, userName is required",
		});
		return;
	}

	try {
		const exists = await redisClient.exists(userName);

		if (exists) {
			next();
		} else {
			res.status(401).json({
				message: "Unauthorized. A new userName is required",
			});
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
