<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\RedisConnector;
use RedisException;

class IssueController
{
    public static function getAll(Request $request, Response $response, $args): Response
    {
        try {
            $redisConnection = new RedisConnector();
            $resultData = $redisConnection->connection()->lRange("index", 0, -1);
            $jsonResponse = json_encode(['issues' => $resultData]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error' . $e]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
        }
    }

    public static function getOne(Request $request, Response $response, $args): Response
    {
        $issueNumber = $args['issue'];

        try {
            $redisConnection = new RedisConnector();
            $issueArray = $redisConnection->connection()->hMGet($issueNumber,["status", "members", "avg"]);
            $issueMembers = json_decode($issueArray['members'], true);
            $isVoted = true;

            foreach ($issueMembers as $member) {
                if ($member['status'] != 'voted' && $member['status'] != 'passed') {
                    $isVoted =  false;
                }
            }

            unset($member);

            if ($isVoted) {
                $issue = [
                    'status' => $issueArray['status'],
                    'avg' => $issueArray['avg'],
                    'members' => $issueMembers,
                ];
            } else {
                $filterMembersResult = [];

                foreach ($issueMembers as $member) {
                    array_push(
                        $filterMembersResult,
                        [
                            'id' => $member['id'],
                            'name' => $member['name'],
                            'status' => $member['status']
                        ]
                    );
                }

                $issue = [
                    'status' => $issueArray['status'],
                    'members' => $filterMembersResult,
                ];
            }

            $jsonResponse = json_encode(['issue' => $issue]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error' . $e]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
        }
    }

    public static function join(Request $request, Response $response, $args): Response
    {
        $issueNumber = $args['issue'];
        $userName = $request->getHeader('userName');
        $userName = $userName[0];

        try {
            $redisConnection = new RedisConnector();
            $userFullName = $redisConnection->connection()->get($userName);
            $issueExists = $redisConnection->connection()->exists($issueNumber);
            $newMember = ['id' => $userName,'name' => $userFullName,'status' => 'waiting','value' => 0];

            if ($issueExists) {
                $issueMembers = $redisConnection->connection()->hMGet($issueNumber, ['members']);
                $issueMembers = json_decode($issueMembers['members']);

                $memberExist = false;

                foreach ($issueMembers as $key => $object) {
                    if ($object->id == $userName) {
                        $memberExist = true;
                    }
                }

                if ($memberExist) {
                    $jsonResponse = json_encode(['message' => 'The user was already attached to the issue']);
                    $response->getBody()->write("$jsonResponse");
                    return $response
                        ->withHeader('Content-Type', 'application/json')
                        ->withStatus(200);
                }

                $issueMembers[] = $newMember;
                $issueMembers = json_encode($issueMembers);
                $redisConnection->connection()->hMSet($issueNumber, ['status' => 'voting', 'members' => $issueMembers]);
                $jsonResponse = json_encode(['message' => 'Joined the issue successfully']);
                $response->getBody()->write("$jsonResponse");
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(200);
            }

            $members = json_encode([$newMember]);
            $redisConnection->connection()
                ->hMSet($issueNumber, ['status' => 'voting', 'members' => $members, 'avg' => 0]);
            $redisConnection->connection()->rPush('index', $issueNumber);
            $jsonResponse = json_encode(['message' => 'A new issue was created']);
            $response->getBody()->write( $jsonResponse );
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error' . $e]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
        }
    }

    public static function vote(Request $request, Response $response, $args): Response
    {
        $issueNumber = $args['issue'];
        $userName = $request->getHeader('userName');
        $userName = $userName[0];

        try {
            $redisConnection = new RedisConnector();
            $issueMembers = $redisConnection->connection()->hMGet($issueNumber, ['status', 'members', 'avg']);
            $issueMembers = json_decode($issueMembers['members']);
            $isVoted = false;
            $isMember = false;
            $memberStatus = "";

            foreach ($issueMembers as $key => $object) {
                if ($object->status == 'voted' || $object->status == 'passed') {
                    $isVoted = true;
                }

                if ($object->id == $userName) {
                    $isMember = true;
                    $memberStatus = $object->status;
                }
            }

            if (!$isMember) {
                $jsonResponse = json_encode(['message'=> 'The user is not joined to this issue']);
                $response->getBody()->write("$jsonResponse");
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(200);
            }

            if ($memberStatus != 'waiting') {
                $jsonResponse = json_encode(['message'=> 'The user already voted on this issue']);
                $response->getBody()->write("$jsonResponse");
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(200);
            }

            if($isVoted) {
                $jsonResponse = json_encode(['message'=> 'The issue has already been voted']);
                $response->getBody()->write("$jsonResponse");
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(200);
            }
            
            // TODO: VOTE ISSUE

            $jsonResponse = json_encode(['message'=> 'The vote was counted']);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (RedisException $e) {
            $jsonResponse = json_encode(['message'=> 'Database error' . $e]);
            $response->getBody()->write("$jsonResponse");
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(500);
        }
    }
}