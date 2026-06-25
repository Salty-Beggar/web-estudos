<?php

require_once 'model/Usuario.php';
require_once 'model/Feed.php';
require_once 'model/Post.php';
require_once 'model/Categoria.php';

class UsuarioController {
    private function limparUsuario($usuario) {
        if (!$usuario) return null;
        $usuario->senha = null;
        return $usuario;
    }

    private function buscarAmigos($usuarioID) {
        $amigos = Usuario::select(
            'usuarios.*',
            " JOIN usuarios_amigos ON usuarios_amigos.amigo_id = usuarios.id WHERE usuarios_amigos.usuario_id = ? ORDER BY usuarios.nome ASC",
            [$usuarioID]
        );

        foreach ($amigos as &$amigo) {
            $amigo = $this->limparUsuario($amigo);
        }

        return $amigos;
    }

    public function add($body) {
        if (empty($body->nome) || empty($body->email) || empty($body->senha)) {
            return resposta('Nome, email e senha são obrigatórios!', 400, false);
        }

        $usuario = new Usuario();
        $body->senha = base64_encode($body->senha);
        $body->foto = $body->foto ?? '/assets/imgs/users/guest_user.svg';
        $body->biografia = $body->biografia ?? null;

        if (!empty(Usuario::select('nome', " WHERE nome = ?", [$body->nome]))) {
            return resposta('Nome já existe!', 403, false);
        }
        if (!empty(Usuario::select('senha', " WHERE senha = ?", [$body->senha]))) {
            return resposta('Senha já existe!', 403, false);
        }
        if (!empty(Usuario::select('email', " WHERE email = ?", [$body->email]))) {
            return resposta('Email já existe!', 403, false);
        }
        $usuario->fill($body);
        $usuario->insertSelf();
        $usuario->senha = null;

        return resposta($usuario, 201);
    }

    public function selectOne($usuarioLogado, $id) {
        $usuario = Usuario::select('*', " WHERE id = ?", [$id])[0] ?? null;
        if (!$usuario) return resposta('Usuário não encontrado!', 404, false);
        $usuario = $this->limparUsuario($usuario);

        $feeds = Feed::select('*', " WHERE usuario_id = ? ORDER BY id ASC", [$id]);
        foreach ($feeds as &$feed) {
            $feed->loadRelation('categorias');
        }
        //pega post ligado a curso e curso ligado a usuario id da tabela favoritos
        // $cursos_favoritados = DB::queryAssoc("SELECT post.* FROM usuarios_cursos_favoritos JOIN cursos ON usuarios_cursos_favoritos.curso_id = cursos.post_id WHERE usuarios_cursos_favoritos.usuario_id = ?", [$id]);
        $cursos_favoritados = DB::queryAssoc("SELECT posts.* FROM usuarios_cursos_favoritos JOIN cursos ON usuarios_cursos_favoritos.curso_id = cursos.post_id JOIN posts ON cursos.post_id = posts.id WHERE usuarios_cursos_favoritos.usuario_id = ?", [$usuario->id]);
        // $cursos_favoritados = Post::select('*', " WHERE usuario_id = ? AND tipo = 1 ORDER BY data_criacao DESC", [$id]);
        // foreach ($cursos_favoritados as &$curso) {
        //     $curso->loadRelation('categorias');
        // }

        $usuarioJson = $usuario->jsonSerialize();
        $usuarioJson['feeds'] = $feeds;
        $usuarioJson['cursos'] = $cursos_favoritados;
        $usuarioJson['categorias'] = Categoria::select('*', " ORDER BY nome ASC LIMIT 40");
        $usuarioJson['amigos'] = $this->buscarAmigos((int)$id);
        $usuarioJson['servidores'] = [[
            'id' => 1,
            'nome' => 'KnowledgeHub',
            'img' => '/assets/imgs/servers/ifrs-informatica.jpg',
            'grupos' => [],
            'cursos' => $usuarioJson['cursos']
        ]];

        return resposta(['usuario' => $usuarioJson]);
    }

    public function amigos($usuarioLogado) {
        return resposta($this->buscarAmigos((int)$usuarioLogado->id));
    }

    public function addAmigo($usuarioLogado, $body) {
        $amigoID = (int)($body->amigo_id ?? $body->id ?? 0);
        if ($amigoID <= 0) return resposta('amigo_id é obrigatório!', 400, false);
        if ($amigoID === (int)$usuarioLogado->id) return resposta('Você não pode adicionar você mesmo como amigo!', 400, false);

        $amigo = Usuario::select('id', " WHERE id = ?", [$amigoID])[0] ?? null;
        if (!$amigo) return resposta('Usuário amigo não encontrado!', 404, false);

        DB::executar("INSERT IGNORE INTO usuarios_amigos (usuario_id, amigo_id) VALUES (?, ?)", [(int)$usuarioLogado->id, $amigoID]);
        DB::executar("INSERT IGNORE INTO usuarios_amigos (usuario_id, amigo_id) VALUES (?, ?)", [$amigoID, (int)$usuarioLogado->id]);

        return resposta($this->buscarAmigos((int)$usuarioLogado->id), 201);
    }

    public function deleteAmigo($usuarioLogado, $amigoID) {
        $amigoID = (int)$amigoID;
        DB::executar("DELETE FROM usuarios_amigos WHERE usuario_id = ? AND amigo_id = ?", [(int)$usuarioLogado->id, $amigoID]);
        DB::executar("DELETE FROM usuarios_amigos WHERE usuario_id = ? AND amigo_id = ?", [$amigoID, (int)$usuarioLogado->id]);

        return resposta($this->buscarAmigos((int)$usuarioLogado->id));
    }
}
