<?php

declare(strict_types=1);

use DI\Container;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

// Container
$container = new Container();
$settings =  require __DIR__ . '/../App/Settings.php';
$settings($container);
AppFactory::setContainer($container);

// App
$app = AppFactory::create();

// Middleware
$middleware =  require __DIR__ . '/../App/Middleware.php';
$middleware($app);

// Routes
$routes = require __DIR__ . '/../App/Routes.php';
$routes($app);

// App run
$app->run();
