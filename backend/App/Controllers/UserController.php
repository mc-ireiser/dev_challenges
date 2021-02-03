<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
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
                $response->getBody()->write("$jsonResponse");
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(409);
            }

            $redisConnection->connection()->set($userName, $name);
            $jsonResponse = json_encode([
                'name' => $name,
                'userName' => $userName
            ]);
            $response->getBody()->write("$jsonResponse");

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(201);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error: ' . $e]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
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
                $response->getBody()->write("$jsonResponse");
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(404);
            }

            $resultGetData = $redisConnection->connection()->get($userName[0]);
            $jsonResponse = json_encode(['name' => $resultGetData]);
            $response->getBody()->write("$jsonResponse");

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error: ', $e]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
        }
    }
}
