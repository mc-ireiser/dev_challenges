<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\RedisConnector;
use RedisException;

class DbController
{
    public static function reset(Request $request, Response $response, $args): Response
    {
        try {
            $redisConnection = new RedisConnector();
            $redisConnection->connection()->flushDB();
            $jsonResponse = json_encode(['message'=> 'The database was deleted']);
            return (new Utils\ReturnResponse)->send($response, $jsonResponse, 200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error' . $e]);
            return (new Utils\ReturnResponse)->send($response, $jsonResponse, 500);
        }
    }
}