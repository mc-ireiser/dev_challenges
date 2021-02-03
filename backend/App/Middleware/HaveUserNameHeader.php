<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Rakit\Validation\Validator;
use Slim\Psr7\Factory\ResponseFactory;

class HaveUserNameHeader
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $payload = $request->getHeader('userName');
        $validator = new Validator;
        $validation = $validator->make($payload, ['0' => 'required']);
        $validation->validate();

        if ($validation->fails()) {
            $errors = $validation->errors();
            $jsonResponse = json_encode(['message' => 'userName is required' ,'error' => $errors->firstOfAll()]);
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
