const { createNodeRedisClient } = require("handy-redis");

const db = process.env.REDISDB;
const host = process.env.NODE_ENV === "testing" ? "127.0.0.1" : "redis";
const port = 6379;

const client = createNodeRedisClient({
	host,
	port,
	db,
});

module.exports = client;
