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
        $cursos = DB::queryAssoc(
            "SELECT posts.*, cursos.origem_curso_id
             FROM posts
             JOIN cursos ON cursos.post_id = posts.id
             WHERE posts.usuario_id = ? AND posts.tipo = 1
             ORDER BY posts.titulo ASC, posts.id ASC",
            [(int)$id]
        );

        foreach ($cursos as &$curso) {
            $curso['id'] = (int)($curso['id'] ?? 0);
            $curso['usuario_id'] = (int)($curso['usuario_id'] ?? 0);
            $curso['tipo_id'] = 1;
            $curso['tipo_nome'] = 'curso';
            $curso['proprietario'] = (int)$id === (int)$usuarioLogado->id;
            $curso['curso_salvo'] = true;
            $curso['publicado'] = !empty($curso['publicado']);
            $curso['categorias'] = DB::queryAssoc(
                "SELECT categorias.*
                 FROM categorias
                 JOIN posts_categorias ON posts_categorias.categoria_id = categorias.id
                 WHERE posts_categorias.post_id = ?
                 ORDER BY categorias.nome ASC",
                [$curso['id']]
            );
        }

        $usuarioJson = $usuario->jsonSerialize();
        $usuarioJson['feeds'] = $feeds;
        $usuarioJson['cursos'] = $cursos;
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

    public function update($usuarioLogado, $body) {
        $usuarioID = (int)$usuarioLogado->id;
        $nome = isset($body->nome) ? trim((string)$body->nome) : null;
        $email = isset($body->email) ? trim(strtolower((string)$body->email)) : null;
        $biografia = isset($body->biografia) ? trim((string)$body->biografia) : null;

        if ($nome !== null && $nome === '') return resposta('O nome não pode ficar vazio!', 400, false);
        if ($email !== null) {
            if ($email === '') return resposta('O email não pode ficar vazio!', 400, false);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return resposta('Email inválido!', 400, false);
            $emailExistente = DB::queryAssoc('SELECT id FROM usuarios WHERE email = ? AND id <> ?', [$email, $usuarioID]);
            if (!empty($emailExistente)) return resposta('Esse email já está sendo usado por outro usuário!', 409, false);
        }

        $usuario = Usuario::select('*', ' WHERE id = ?', [$usuarioID])[0] ?? null;
        if (!$usuario) return resposta('Usuário não encontrado!', 404, false);

        if ($nome !== null) $usuario->nome = $nome;
        if ($email !== null) $usuario->email = $email;
        if ($biografia !== null) $usuario->biografia = $biografia;

        DB::executar(
            'UPDATE usuarios SET nome = ?, email = ?, biografia = ? WHERE id = ?',
            [$usuario->nome, $usuario->email, $usuario->biografia, $usuarioID]
        );

        $usuarioAtualizado = Usuario::select('*', ' WHERE id = ?', [$usuarioID])[0] ?? null;
        return resposta($this->limparUsuario($usuarioAtualizado));
    }

    public function atualizarAvatar($usuarioLogado, $body) {
        $usuarioID = (int)$usuarioLogado->id;
        $imagem = $body->imagem ?? $body->image ?? $body->foto_base64 ?? '';
        if (!is_string($imagem) || $imagem === '') return resposta('Imagem é obrigatória!', 400, false);

        if (!preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,/', $imagem, $matches)) {
            return resposta('Envie a imagem em base64 no formato data:image.', 400, false);
        }

        $base64 = preg_replace('/^data:image\/(png|jpeg|jpg|webp);base64,/', '', $imagem);
        $binario = base64_decode($base64, true);
        if ($binario === false) return resposta('Imagem inválida!', 400, false);
        if (strlen($binario) > 8 * 1024 * 1024) return resposta('Imagem muito grande!', 413, false);

        $usuario = Usuario::select('*', ' WHERE id = ?', [$usuarioID])[0] ?? null;
        if (!$usuario) return resposta('Usuário não encontrado!', 404, false);

        $hashEmail = substr(hash('sha256', strtolower((string)$usuario->email)), 0, 20);
        $arquivo = "user_{$usuarioID}_{$hashEmail}.png";
        $diretorios = [
            '/var/www/public_assets/users',
            __DIR__ . '/../../public/assets/imgs/users'
        ];

        $salvo = false;
        foreach ($diretorios as $diretorio) {
            if (!is_dir($diretorio)) @mkdir($diretorio, 0775, true);
            if (is_dir($diretorio) && is_writable($diretorio)) {
                $salvo = file_put_contents($diretorio . '/' . $arquivo, $binario) !== false;
                if ($salvo) break;
            }
        }

        if (!$salvo) {
            return resposta('Não foi possível salvar a imagem na pasta pública de usuários.', 500, false);
        }

        $caminho = '/assets/imgs/users/' . $arquivo;
        DB::executar('UPDATE usuarios SET foto = ? WHERE id = ?', [$caminho, $usuarioID]);
        $usuario->foto = $caminho;

        return resposta($this->limparUsuario($usuario));
    }

}
