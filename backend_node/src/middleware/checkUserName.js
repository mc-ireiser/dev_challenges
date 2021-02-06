const redisClient = require("../helpers/redis");
const Joi = require("joi");

module.exports = async function checkuserName(req, res, next) {
	const userName = req.headers.username;
	const userNameIsValid = Joi.string().required().validate(userName);

	if (!userNameIsValid.value) {
		return res.status(401).json({
			message: "Auth failed, userName is required",
		});
	}

	try {
		const userNameExists = await redisClient.exists(userName);

		if (!userNameExists) {
			return res.status(401).json({
				message: "Unauthorized. A new userName is required",
			});
		}

		next();
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
