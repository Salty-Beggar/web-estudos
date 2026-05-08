<?php

$mostrarErros = true;

ini_set('display_errors', $mostrarErros ? '1' : 0);
ini_set('display_startup_errors', $mostrarErros ? '1' : 0);

#region Respostas

function resposta(mixed $mensagem, $http_codigo = 200) {
    http_response_code($http_codigo);
    return json_encode([
        'mensagem' => $mensagem
    ]);
}

#endregion

#region Fetch

function fetchController(String $controllerNome) {
    require_once "./controller/{$controllerNome}.php";
}

function fetchModel(String $modelName) {
    require_once "./model/{$modelName}.php";
    // echo 'Modelell:'.$modelName;
    $modelName::fetch();
}

#endregion

require_once "carregar_db.php";
require_once "carregar_router.php";

#region Rotas

$router = new Router();

#region Feed
$router->get('/', ['FeedController', 'carregarFeed']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

#endregion

