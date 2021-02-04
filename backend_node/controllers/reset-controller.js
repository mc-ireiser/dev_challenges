const redisClient = require("../helpers/redis");

exports.resetdb = async (req, res, next) => {
	try {
		const result = await redisClient.flushall();

		return res.json({
			message: result === "OK" ? "The database was deleted" : result,
		});
	} catch (error) {
		return res.status(500).json({
			message: `Server error ${error}`,
		});
	}
};
