const { createNodeRedisClient } = require("handy-redis");

const dbNumber = process.env.NODE_ENV === "testing" ? 1 : 0;

const client = createNodeRedisClient({
	host: "redis",
	port: 6379,
	db: dbNumber,
});

module.exports = client;
