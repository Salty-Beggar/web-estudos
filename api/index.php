<?php



ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

function fetchController(String $controllerNome) {
    require_once "./controller/{$controllerNome}.php";
}

function fetchModel(String $modelName) {
    require_once "./model/{$modelName}.php";
    $modelName::fetch();
}

require_once "carregar_db.php";
require_once "carregar_router.php";

$router = new Router();

#region Feed
$router->get('/', ['FeedController', 'carregarFeed']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
