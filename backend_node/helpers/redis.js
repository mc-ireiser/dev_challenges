// const redis = require("redis");
const { createNodeRedisClient } = require("handy-redis");
const client = createNodeRedisClient({ host: "redis", port: 6379 });

module.exports = client;
