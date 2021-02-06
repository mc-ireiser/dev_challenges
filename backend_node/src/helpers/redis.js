const { createNodeRedisClient } = require("handy-redis");

const dbNumber = process.env.REDISDB;

const client = createNodeRedisClient({
	host: "redis",
	port: 6379,
	db: dbNumber,
});

module.exports = client;
