const redisClient = require("../helpers/redis");
// const { v4: uuidv4 } = require("uuid");

exports.loginUser = async (req, res, next) => {
	const token = req.body.token;

	if (!token) {
		return res.status(400).json({
			message: "All fields are required",
		});
	}

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
};

exports.createUser = async (req, res, next) => {
	const name = req.body.name;
	const token = req.body.token; // uuidv4();

	if (!token || !name) {
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

	const result = await redisClient.set(token, name); // setex(token, 3600, name);

	if (result === "OK") {
		res.status(201).json({
			name,
			token,
			result,
		});
	} else {
		res.status(500).json({
			result,
		});
	}
};
