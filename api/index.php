<?php


$mostrarErros = true;

// ini_set('display_warnings', 0);
ini_set('display_errors', $mostrarErros ? '1' : 0);
ini_set('display_startup_errors', $mostrarErros ? '1' : 0);
ini_set('default_encoding', 'utf-8');

#region Respostas

function resposta(mixed $mensagem, $http_codigo = 200, $success = true) {
    http_response_code($http_codigo);
    return json_encode([
        'mensagem' => $mensagem,
        'success' => $success
    ]);
}

#endregion

#region Fetch

function fetchController(String $controllerNome) {
    if (class_exists($controllerNome)) return;
    require_once "./controller/{$controllerNome}.php";
}

function fetchModel(String $modelName) {
    
    // echo 'Posterior: ';

    // echo '<br>';
    // echo '<br>';

    if (class_exists($modelName)) return;
    require_once "./model/{$modelName}.php";
    $modelName::fetch();


    // echo 'Anterior: ';

    // echo '<br>';
    // echo '<br>';
}

#endregion

require_once "carregar_db.php";
require_once "carregar_router.php";

#region Rotas

$router = new Router();

#region Autenticação
$router->post('/auth/criarConta', ['UsuarioController', 'add']);
$router->post('/auth/login', ['AuthController', 'fazerLogin']);
#endregion

#region Feed
$router->get('/feed/{config}', ['FeedController', 'carregarFeed']);
/*
Padrão 
{
    pesquisa: string,
    feed_id: number
}
*/
$router->post('/feed/add', ['FeedController', 'add']);
$router->put('/feed/update', ['FeedController', 'update']);
$router->delete('/feed/delete', ['FeedController', 'delete']);
#endregion

#region Post
$router->put('/post/vote', ['PostController', 'usuarioVotar']);
#endregion

#region Categoria
// $router->get('/categoria/selectMany', ['CategoriaController', 'selectMany']);
// $router->post('/categoria/add', ['CategoriaController', 'add']);
#endregion

// PARA_AGORA: Fazer outras rotas, e integrar com o front.
$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

#endregion

