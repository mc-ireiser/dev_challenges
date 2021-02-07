<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Controllers\Utils\ReturnResponse;
use App\RedisConnector;
use RedisException;

class UserController
{
    public static function create(Request $request, Response $response): Response
    {
        $payload = $request->getParsedBody();
        $name = $payload['name'];
        $userName = $payload['userName'];

        try {
            $redisConnection = new RedisConnector();
            $userExists = $redisConnection->connection()->exists($userName);

            if ($userExists) {
                $jsonResponse = json_encode(['message'=> 'User already exists']);
                return (new Utils\ReturnResponse)->send($response, $jsonResponse, 409);
            }

            $redisConnection->connection()->set($userName, $name);
            $jsonResponse = json_encode(['name' => $name,  'userName' => $userName]);
            return (new Utils\ReturnResponse)->send($response, $jsonResponse, 201);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error: ' . $e]);
            return (new Utils\ReturnResponse)->send($response, $jsonResponse, 500);
        }
    }

    public static function login(Request $request, Response $response): Response
    {
        $userName = $request->getHeader('userName');

        try {
            $redisConnection = new RedisConnector();
            $userExists = $redisConnection->connection()->exists($userName[0]);

            if (!$userExists) {
                $jsonResponse = json_encode(['message'=> 'User was not found']);
                return (new Utils\ReturnResponse)->send($response, $jsonResponse, 404);
            }

            $resultGetData = $redisConnection->connection()->get($userName[0]);
            $jsonResponse = json_encode(['name' => $resultGetData]);
            return (new Utils\ReturnResponse)->send($response, $jsonResponse, 200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error: ', $e]);
            return (new Utils\ReturnResponse)->send($response, $jsonResponse, 500);
        }
    }
}
