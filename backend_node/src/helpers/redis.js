const { createNodeRedisClient } = require("handy-redis");

const db = process.env.REDISDB;
const host = "redis";
const port = 6379;

const client = createNodeRedisClient({
	host,
	port,
	db,
});

module.exports = client;
