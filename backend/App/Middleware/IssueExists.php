<?php

declare(strict_types=1);

namespace App\Middleware;

use App\RedisConnector;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Routing\RouteContext;

class IssueExists
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $routeContext = RouteContext::fromRequest($request);
        $route = $routeContext->getRoute();
        $issue = $route->getArgument('issue');

        $redisConnection = new RedisConnector();
        $issueExists = $redisConnection->connection()->exists($issue);

        if (!$issueExists) {
            $jsonResponse = json_encode(['message' => 'The requested issue does not exist']);
            $responseFactory = new ResponseFactory();
            $response = $responseFactory->createResponse();
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(404);
        }

        return $response = $handler->handle($request);
    }
}