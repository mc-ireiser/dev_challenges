const redisClient = require("../helpers/redis");

exports.resetdb = async (req, res, next) => {
	try {
		const result = await redisClient.flushall();

		res.json({
			message: result === "ok" ? "The database was deleted" : result,
		});
	} catch (error) {
		console.log(error);
	}
};
