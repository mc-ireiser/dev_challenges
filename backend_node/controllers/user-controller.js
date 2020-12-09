const redisClient = require("../helpers/redis");
const Joi = require("joi");

exports.loginUser = async (req, res, next) => {
	const token = req.body.token;
	const tokenIsValid = Joi.string().required().validate(token);

	if (!tokenIsValid.value) {
		return res.status(400).json({
			message: "Username required",
		});
	}

	try {
		const result = await redisClient.get(token);
		if (result) {
			res.status(200).json({
				name: result,
			});
		} else {
			res.status(404).json({
				message: "User was not found",
			});
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

exports.createUser = async (req, res, next) => {
	const name = req.body.name;
	const token = req.body.token;

	const nameIsValid = Joi.string().required().validate(name);
	const tokenIsValid = Joi.string().required().validate(token);

	if (!tokenIsValid.value || !nameIsValid.value) {
		return res.status(400).json({
			message: "All fields are required",
		});
	}

	const tokenExists = await redisClient.exists(token);

	if (tokenExists) {
		res.status(409).json({
			message: "User already exists",
		});
		return;
	}

	try {
		const result = await redisClient.set(token, name);
		if (result === "OK") {
			res.status(201).json({
				name,
				token,
				result,
			});
		} else {
			res.status(500).json({
				message: result,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
