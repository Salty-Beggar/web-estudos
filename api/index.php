<?php

function configurarCors(): void {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=UTF-8");
}

configurarCors();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$mostrarErros = false;

error_reporting(E_ALL);
ini_set('display_errors', $mostrarErros ? '1' : '0');
ini_set('display_startup_errors', $mostrarErros ? '1' : '0');
ini_set('log_errors', '1');
ini_set('default_encoding', 'utf-8');

#region Respostas

function resposta(mixed $mensagem, $http_codigo = 200, $success = true) {
    http_response_code($http_codigo);
    return json_encode([
        'mensagem' => $mensagem,
        'success' => $success,
        'sucesso' => $success
    ], JSON_UNESCAPED_UNICODE);
}

#endregion

#region Fetch

function fetchController(String $controllerNome) {
    if (class_exists($controllerNome)) return;
    require_once "./controller/{$controllerNome}.php";
}

function fetchModel(String $modelName) {
    if (class_exists($modelName)) return;
    require_once "./model/{$modelName}.php";
    $modelName::fetch();
}

#endregion

require_once "carregar_db.php";
require_once "carregar_router.php";

#region Rotas

$router = new Router();

#region Autenticação
$router->post('/auth/criarConta', ['UsuarioController', 'add'], false);
$router->post('/auth/login', ['AuthController', 'fazerLogin'], false);
$router->post('/usuario', ['AuthController', 'fazerLogin'], false); // alias antigo do front
$router->get('/auth/me', ['AuthController', 'me']);
$router->get('/usuario/me', ['AuthController', 'me']);
#endregion

#region Usuário
$router->get('/usuario/amigos', ['UsuarioController', 'amigos']);
$router->post('/usuario/amigo/add', ['UsuarioController', 'addAmigo']);
$router->delete('/usuario/amigo/delete/{id}', ['UsuarioController', 'deleteAmigo']);
$router->put('/usuario/update', ['UsuarioController', 'update']);
$router->post('/usuario/avatar', ['UsuarioController', 'atualizarAvatar']);
$router->get('/usuario/{id}', ['UsuarioController', 'selectOne']);
#endregion

#region Feed
$router->get('/feed/{feedID}', ['FeedController', 'carregarFeed']);
$router->get('/feed/{feedID}/{pesquisa}', ['FeedController', 'carregarFeed']);
$router->get('/feed', ['FeedController', 'select']);
$router->get('/feeds', ['FeedController', 'select']); // alias antigo do front
$router->get('/feeds/{feedID}', ['FeedController', 'carregarFeed']); // alias antigo do front
$router->post('/feed', ['FeedController', 'add']);
$router->post('/feed/add', ['FeedController', 'add']);
$router->put('/feed/update', ['FeedController', 'update']);
$router->put('/feed/ativo/{id}', ['FeedController', 'definirAtivo']);
$router->post('/feed/ativo/{id}', ['FeedController', 'definirAtivo']);
$router->delete('/feed/delete', ['FeedController', 'delete']);
$router->delete('/feed/delete/{id}', ['FeedController', 'delete']);
$router->put('/feed/categoria/add/{id}/{categoriaID}', ['FeedController', 'addCategoria']);
$router->post('/feed/categoria/add/{id}/{categoriaID}', ['FeedController', 'addCategoria']);
$router->delete('/feed/categoria/delete', ['FeedController', 'deleteCategoria']);
$router->delete('/feed/categoria/delete/{feedID}/{categoriaID}', ['FeedController', 'deleteCategoria']);
#endregion

#region Post
$router->get('/posts', ['PostController', 'selectAll']);
$router->get('/posts/{id}', ['PostController', 'selectOne']);
$router->put('/post/vote', ['PostController', 'usuarioVotar']);
$router->put('/post/publicar/{id}', ['PostController', 'publicar']);
$router->put('/post/despublicar/{id}', ['PostController', 'despublicar']);
$router->get('/curso/{id}', ['PostController', 'curso_selectOne']);
$router->get('/cursos', ['PostController', 'curso_selectUsuario']);
$router->post('/curso/add', ['PostController', 'curso_criar']);
$router->put('/curso/post/add', ['PostController', 'curso_addPost']);
$router->post('/curso/post/add', ['PostController', 'curso_addPost']);
$router->get('/curso/usuario', ['PostController', 'curso_selectUsuario']);
$router->post('/curso/salvar', ['PostController', 'curso_salvar']);
$router->post('/curso/copiar', ['PostController', 'curso_salvar']);
$router->post('/curso/favoritar', ['PostController', 'curso_salvar']);
$router->post('/curso/desfavoritar', ['PostController', 'curso_desfavoritar']);
$router->delete('/curso/favoritar/{id}', ['PostController', 'curso_desfavoritar']);
$router->delete('/curso/desfavoritar/{id}', ['PostController', 'curso_desfavoritar']);
$router->get('/artigo/{id}', ['PostController', 'artigo_selectOne']);
$router->post('/artigo/add', ['PostController', 'artigo_criar']);
$router->get('/atividade/{id}', ['PostController', 'atividade_selectOne']);
$router->post('/atividade/add', ['PostController', 'atividade_criar']);
$router->get('/prova/{id}', ['PostController', 'prova_selectOne']);
$router->get('/prova/usuario', ['PostController', 'prova_selectUsuario']);
$router->post('/prova/add', ['PostController', 'prova_criar']);
$router->post('/prova/atividade/add', ['PostController', 'prova_addAtividade']);
$router->put('/prova/atividade/add', ['PostController', 'prova_addAtividade']);
#endregion

#region Categoria
$router->get('/categoria', ['CategoriaController', 'select']);
$router->get('/categoria/{pesquisa}', ['CategoriaController', 'select']);
$router->post('/categoria/add', ['CategoriaController', 'add']);
#endregion

$router->lerRota($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

#endregion
