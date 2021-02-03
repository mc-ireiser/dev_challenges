<?php

declare(strict_types=1);

use App\Middleware\HaveIssueParam;
use App\Middleware\HaveUserDataBody;
use App\Middleware\HaveUserNameHeader;
use App\Middleware\IssueExists;
use App\Middleware\UserNameExists;
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\UserController;
use App\Controllers\IssueController;
use App\Controllers\DbController;
use Slim\App;

return function (App $app){
    $app->group('/user', function (RouteCollectorProxy $userGroup) use ($app) {
        $userGroup->post('', [UserController::class, "create"])->setName('create-new-user')->add(new HaveUserDataBody());
        $userGroup->post('/login', [UserController::class, 'login'])->setName('login-user')->add(new HaveUserNameHeader());
    });

    $app->group('/issue', function (RouteCollectorProxy $issueGroup) use ($app) {
        $issueGroup->get('/all', [IssueController::class, 'getAll'])->setName('get-all-issue');
        $issueGroup->get('/{issue}', [IssueController::class, 'getOne'])->setName('get-one-issue')->add(new IssueExists())->add(new HaveIssueParam());
        $issueGroup->post('/{issue}/join', [IssueController::class, 'join'])->setName('join-issue')->add(new UserNameExists())->add(new HaveUserNameHeader())->add(new HaveIssueParam());
        $issueGroup->post('/{issue}/vote', [IssueController::class, 'vote'])->setName('vote-issue')->add(new UserNameExists())->add(new HaveUserNameHeader())->add(new IssueExists())->add(new HaveIssueParam());
    });

    $app->get('/reset', [DbController::class, 'reset'])->setName('reset-db');
};

