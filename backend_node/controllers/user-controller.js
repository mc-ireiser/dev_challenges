const { v4: uuidv4 } = require("uuid");
const redisClient = require("../helpers/redis");

exports.createUser = async (req, res, next) => {
	const name = req.body.name;
	const token = uuidv4();

	if (!name || typeof name !== "string") {
		return res.status(400).json({
			message: "A name is required",
		});
	}

	try {
		const result = await redisClient.setex(token, 3600, name);

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
	} catch (error) {
		console.error(error);
	}
};
