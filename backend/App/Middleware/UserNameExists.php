<?php

declare(strict_types=1);

namespace App\Middleware;

use App\RedisConnector;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Factory\ResponseFactory;

class UserNameExists
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $userName = $request->getHeader('userName');
        $redisConnection = new RedisConnector();
        $userExists = $redisConnection->connection()->exists($userName);

        if (!$userExists) {
            $jsonResponse = json_encode(['message' => 'Username not found']);
            $responseFactory = new ResponseFactory();
            $response = $responseFactory->createResponse();
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(404);
        }

        return $request = $handler->handle($request);
    }
}