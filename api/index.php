<?php

require_once "carregar_db.php";
require_once "carregar_router.php";

$router = new Router();

#region Feed
$router->get('/', ['FeedController', 'carregarFeed']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

$router = new Router();

#region Feed
$router->get('/', ['FeedController', 'carregarFeed']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

$router = new Router();

#region Feed
$router->get('/', ['FeedController', 'carregarFeed']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);