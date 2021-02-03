<?php

declare(strict_types=1);

use DI\Container;

return function (Container $container) {
    $container->set('settings', function () {
        return [
            'name' => 'The Planning Poker Lobby',
            'displayErrorDetails' => false,
            'logErrors' => true,
            'logErrorDetails' => true,
        ];
    });
};
