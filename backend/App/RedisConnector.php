<?php

namespace App;

use Redis;

class RedisConnector
{
    private string $host = 'redis';
    private int $port = 6379;

    public function connection(): Redis
    {
        $redis = new Redis();
        $redis->connect($this->host, $this->port);

        return $redis;
    }
}
