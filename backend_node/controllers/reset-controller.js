const redisClient = require("../helpers/redis");

exports.resetdb = async (req, res, next) => {
	try {
		const result = await redisClient.flushall();

		res.json({
			result,
		});
	} catch (error) {
		console.log(error);
	}
};
