<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Rakit\Validation\Validator;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Routing\RouteContext;

class HaveIssueParam
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $routeContext = RouteContext::fromRequest($request);
        $route = $routeContext->getRoute();
        $issue = $route->getArgument('issue');

        $checkIssue = ['issue' => "$issue"];
        $validator = new Validator;
        $validation = $validator->make($checkIssue, ['issue' => 'required|numeric']);
        $validation->validate();

        if ($validation->fails()) {
            $errors = $validation->errors();
            $jsonResponse = json_encode(['message' => 'Issue number is required' ,'error' => $errors->firstOfAll()]);
            $responseFactory = new ResponseFactory();
            $response = $responseFactory->createResponse();
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(400);
        }

        return $request = $handler->handle($request);
    }
}
