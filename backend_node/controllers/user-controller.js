const redisClient = require("../helpers/redis");
const Joi = require("joi");

exports.loginUser = async (req, res) => {
	const userName = req.headers.username;
	const userNameIsValid = Joi.string().required().validate(userName);

	if (!userNameIsValid.value) {
		return res.status(400).json({
			message: "Username required",
		});
	}

	try {
		const result = await redisClient.get(userName);

		if (!result) {
			return res.status(404).json({
				message: "User was not found",
			});
		}

		return res.status(200).json({
			name: result,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};

exports.createUser = async (req, res) => {
	const name = req.body.name;
	const userName = req.body.userName;
	const nameIsValid = Joi.string().required().validate(name);
	const userNameIsValid = Joi.string().required().validate(userName);

	if (!userNameIsValid.value || !nameIsValid.value) {
		return res.status(400).json({
			message: "All fields are required",
		});
	}

	const userNameExists = await redisClient.exists(userName);

	if (userNameExists) {
		return res.status(409).json({
			message: "User already exists",
		});
	}

	try {
		const result = await redisClient.set(userName, name);

		if (result !== "OK") {
			return res.status(500).json({
				message: result,
			});
		}

		return res.status(201).json({
			name,
			userName,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
