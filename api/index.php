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
$router->post('/auth/criarConta', ['UsuarioController', 'add'], false); // Funcionando
$router->post('/auth/login', ['AuthController', 'fazerLogin'], false); // Funcionando
#endregion

#region Feed
// Busca
$router->get('/feed/{feedID}', ['FeedController', 'carregarFeed']); // Funcionando
$router->get('/feed/{feedID}/{pesquisa}', ['FeedController', 'carregarFeed']); // Funcionando
// Criação e edição
$router->get('/feed', ['FeedController', 'select']); // Funcionando
$router->post('/feed/add', ['FeedController', 'add']); // Funcionando
$router->put('/feed/update', ['FeedController', 'update']);
$router->delete('/feed/delete', ['FeedController', 'delete']);
// Categorias
$router->put('/feed/categoria/add/{id}/{categoriaID}', ['FeedController', 'addCategoria']);
$router->delete('/feed/categoria/delete', ['FeedController', 'deleteCategoria']);
#endregion

#region Post
$router->put('/post/vote', ['PostController', 'usuarioVotar']);
$router->put('/post/save', ['PostController', 'usuarioSalvar']); // Salva o post no curso padrão, principal.
/**
 * Adicionar coluna no banco de dados para flaggar o curso padrão do usuário.
*/
$router->get('/curso/{id}', ['PostController', 'curso_selectOne']);
$router->get('/artigo/{id}', ['PostController', 'artigo_selectOne']);
$router->get('/atividade/{id}', ['PostController', 'atividade_selectOne']);
#region Curso
$router->get('/curso/usuario', ['PostController', 'curso_selectUsuario']);
#endregion
#endregion

#region Categoria
// $router->get('/categoria/selectMany', ['CategoriaController', 'selectMany']);
// $router->post('/categoria/add', ['CategoriaController', 'add']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

#endregion

