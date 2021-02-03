<?php

declare(strict_types=1);

namespace App\Controllers\Utils;

use Psr\Http\Message\ResponseInterface as Response;

class ReturnResponse
{
    public static function send(Response $response, string $jsonResponse, int $code): Response
    {
        $response->getBody()->write("$jsonResponse");
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($code);
    }
}