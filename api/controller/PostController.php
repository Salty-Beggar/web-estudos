<?php

require_once 'model/Post.php';
require_once 'model/Artigo.php';
require_once 'model/Curso.php';
require_once 'model/Usuario.php';
require_once 'model/Categoria.php';

class PostController {
    private function tipoNome($tipo) {
        return match ((int)$tipo) {
            1 => 'curso',
            2 => 'artigo',
            3 => 'questionario',
            4 => 'atividade',
            default => 'post'
        };
    }

    private function resumoTexto($texto, $limite = 170) {
        $texto = preg_replace('/```[\s\S]*?```/', ' ', (string)$texto);
        $texto = preg_replace('/`([^`]+)`/', '$1', $texto);
        $texto = preg_replace('/^#{1,6}\s+/m', '', $texto);
        $texto = preg_replace('/^[-*]\s+/m', '', $texto);
        $texto = preg_replace('/^\d+[.)]\s+/m', '', $texto);
        $texto = str_replace(['*', '_', '#', '>', '`'], '', $texto);
        $texto = trim(preg_replace('/\s+/', ' ', $texto));
        if (strlen($texto) <= $limite) return $texto;
        return trim(substr($texto, 0, $limite)) . '...';
    }

    private function normalizarCategorias($body) {
        $categorias = $body->categorias ?? $body->generos ?? [];
        if (!is_array($categorias)) return [];

        $categorias = array_map(function($categoria) {
            if (is_object($categoria)) return (int)($categoria->id ?? 0);
            if (is_array($categoria)) return (int)($categoria['id'] ?? 0);
            return (int)$categoria;
        }, $categorias);

        return array_values(array_unique(array_filter($categorias, fn($id) => $id > 0)));
    }

    private function salvarCategoriasDoPost($post, $categorias) {
        if (empty($categorias)) return;

        $post->categorias = [];
        foreach ($categorias as $categoriaID) {
            $categoria = Categoria::select('id', " WHERE id = ?", [$categoriaID])[0] ?? null;
            if ($categoria) $post->putRelation('categorias', $categoriaID, []);
        }
        $post->saveRelations('categorias');
    }

    private function formatarPost($post, $usuario, $comDetalhes = false) {
        $post->loadRelation('categorias');
        $postJson = $post->jsonSerialize();
        $postJson['tipo_id'] = (int)$postJson['tipo'];
        $postJson['tipo_nome'] = $this->tipoNome($postJson['tipo']);

        $autor = Usuario::select('*', " WHERE id = ?", [$postJson['usuario_id']])[0] ?? null;
        if ($autor) $autor->senha = null;
        $postJson['usuario'] = $autor;

        $categorias = [];
        foreach (($post->categorias ?? []) as $categoria) {
            $categoriaJson = $categoria->jsonSerialize();
            $voto = DB::queryAssoc("SELECT voto FROM usuarios_posts_categorias WHERE usuario_id = ? AND post_id = ? AND categoria_id = ?", [
                $usuario->id, $postJson['id'], $categoriaJson['id']
            ]);
            $categoriaJson['voto_usuario'] = empty($voto) ? 0 : (int)$voto[0]['voto'];
            $categorias[] = $categoriaJson;
        }
        $postJson['categorias'] = $categorias;

        if ($comDetalhes) {
            if ($postJson['tipo_nome'] === 'artigo') {
                $artigo = DB::queryAssoc("SELECT corpo, formato FROM artigos WHERE post_id = ?", [$postJson['id']]);
                $postJson['corpo'] = $artigo[0]['corpo'] ?? '';
                $postJson['formato_artigo'] = $artigo[0]['formato'] ?? 'markdown';
            }
            if ($postJson['tipo_nome'] === 'curso') {
                $postJson['posts'] = DB::queryAssoc("SELECT posts.* FROM cursos_posts JOIN posts ON cursos_posts.post_id = posts.id WHERE curso_id = ?", [$postJson['id']]);
            }
            if ($postJson['tipo_nome'] === 'atividade') {
                $atividade = DB::queryAssoc("SELECT enunciado, texto, resposta_certa, explicacao FROM atividades WHERE post_id = ?", [$postJson['id']]);
                $postJson['enunciado'] = $atividade[0]['enunciado'] ?? '';
                $postJson['texto_atividade'] = $atividade[0]['texto'] ?? '';
                $postJson['resposta_certa'] = isset($atividade[0]['resposta_certa']) ? (int)$atividade[0]['resposta_certa'] : null;
                $postJson['explicacao_atividade'] = $atividade[0]['explicacao'] ?? '';
                $postJson['opcoes'] = DB::queryAssoc("SELECT id, ordem, texto FROM opcoes WHERE atividade_id = ? ORDER BY ordem", [$postJson['id']]);
            }
        }

        return $postJson;
    }

    public function selectAll($usuario) {
        $posts = Post::select('*', " ORDER BY data_criacao DESC");
        foreach ($posts as &$post) {
            $post = $this->formatarPost($post, $usuario);
        }
        return resposta($posts);
    }

    public function selectOne($usuario, $id) {
        $post = Post::select('*', " WHERE id = ?", [$id])[0] ?? null;
        if (!$post) return resposta('Post não encontrado!', 404, false);
        return resposta($this->formatarPost($post, $usuario, true));
    }

    public function usuarioVotar($usuario, $body) {
        if (!isset($body->post_id, $body->categoria_id, $body->voto)) {
            return resposta('post_id, categoria_id e voto são obrigatórios!', 400, false);
        }

        $usuario_id = $usuario->id;
        $post_id = (int)$body->post_id;
        $categoria_id = (int)$body->categoria_id;
        $voto = max(-1, min(1, (int)$body->voto));

        $votoAtual = DB::queryAssoc("SELECT * FROM usuarios_posts_categorias WHERE
            usuario_id = ?
            AND post_id = ?
            AND categoria_id = ?
        ", [$usuario_id, $post_id, $categoria_id]);

        if (empty($votoAtual)) {
            DB::executar("INSERT IGNORE INTO usuarios_posts (usuario_id, post_id) VALUES (?, ?)", [$usuario_id, $post_id]);
            DB::executar("INSERT INTO usuarios_posts_categorias (usuario_id, post_id, categoria_id, voto) VALUES (?, ?, ?, 0)", [$usuario_id, $post_id, $categoria_id]);
            $votoAtual = DB::queryAssoc("SELECT * FROM usuarios_posts_categorias WHERE
                usuario_id = ?
                AND post_id = ?
                AND categoria_id = ?
            ", [$usuario_id, $post_id, $categoria_id]);
        }
        $votoAtual = $votoAtual[0];

        $post_categoria = DB::queryAssoc("SELECT * FROM posts_categorias WHERE post_id = ? AND categoria_id = ?", [$post_id, $categoria_id]);

        if (empty($post_categoria)) {
            DB::executar("INSERT INTO posts_categorias (post_id, categoria_id) VALUES (?, ?)", [$post_id, $categoria_id]);
        }

        $votoDiff = $voto - (int)$votoAtual['voto'];

        DB::executar("UPDATE usuarios_posts_categorias SET voto = ? WHERE usuario_id = ? AND post_id = ? AND categoria_id = ?", [$voto, $usuario_id, $post_id, $categoria_id]);
        DB::executar("UPDATE posts_categorias SET votos = votos + ? WHERE post_id = ? AND categoria_id = ?", [$votoDiff, $post_id, $categoria_id]);

        return resposta('Voto bem sucedido!');
    }

    function artigo_selectOne($usuario, $artigo_id) {
        $post = Post::select('posts.*, artigos.corpo, artigos.formato', " JOIN artigos ON artigos.post_id = posts.id WHERE posts.id = ?", [$artigo_id], ['corpo', 'formato'])[0] ?? null;
        if (!$post) return resposta('Artigo não encontrado!', 404, false);
        return resposta($this->formatarPost($post, $usuario, true));
    }

    function artigo_criar($usuario, $body) {
        $titulo = trim($body->titulo ?? '');
        $corpo = trim($body->corpo ?? $body->texto ?? '');
        if ($titulo === '') return resposta('O título do artigo é obrigatório!', 400, false);
        if ($corpo === '') return resposta('O texto do artigo é obrigatório!', 400, false);

        $post = new Post();
        $artigo = new Artigo();
        $post->usuario_id = $usuario->id;
        $post->tipo = 2;
        $post->data_criacao = date('Y-m-d');
        $post->fill($body);
        $post->titulo = $titulo;
        $post->insertSelf();

        $artigo->fill($body);
        $artigo->post_id = $post->id;
        $artigo->corpo = $corpo;
        $artigo->formato = $body->formato ?? 'markdown';
        $artigo->insertSelf();

        $this->salvarCategoriasDoPost($post, $this->normalizarCategorias($body));
        $post->loadRelation('categorias');

        return resposta($this->formatarPost($post, $usuario, true), 201);
    }

    function curso_selectOne($usuario, $curso_id) {
        $curso = Post::select('*', " WHERE id = ?", [$curso_id])[0] ?? null;
        if (!$curso) return resposta('Curso não encontrado!', 404, false);
        return resposta($this->formatarPost($curso, $usuario, true));
    }

    function curso_criar($usuario, $body) {
        $post = new Post();
        $curso = new Curso();
        $post->usuario_id = $usuario->id;
        $post->tipo = 1;
        $post->data_criacao = date('Y-m-d');
        $post->fill($body);
        $curso->fill($body);
        $post->insertSelf();
        $curso->post_id = $post->id;
        $curso->insertSelf();
        return resposta([...$post->jsonSerialize(), ...$curso->jsonSerialize()]);
    }

    function curso_addPost($usuario, $body) {
        $curso_id = (int)$body->curso_id;
        $post_id = (int)$body->post_id;
        if (empty(DB::queryAssoc("SELECT * FROM cursos_posts WHERE curso_id = ? AND post_id = ?", [$curso_id, $post_id]))) {
            DB::executar("INSERT INTO cursos_posts (curso_id, post_id) VALUES (?, ?)", [$curso_id, $post_id]);
        }
        return resposta("Post adicionado ao curso com sucesso!");
    }

    function curso_selectUsuario($usuario) {
        $cursos = Post::select('*', " WHERE usuario_id = ? AND tipo = 1", [$usuario->id]);
        return resposta($cursos);
    }

    function atividade_selectOne($usuario, $id) {
        $post = Post::select('*', " WHERE id = ?", [$id])[0] ?? null;
        if (!$post) return resposta('Atividade não encontrada!', 404, false);
        return resposta($this->formatarPost($post, $usuario, true));
    }

    function atividade_criar($usuario, $body) {
        $titulo = trim($body->titulo ?? '');
        $enunciado = trim($body->enunciado ?? $body->questao ?? '');
        $texto = trim($body->texto ?? $body->descricao ?? '');
        $explicacao = trim($body->explicacao ?? '');
        $opcoes = $body->opcoes ?? $body->alternativas ?? [];
        $respostaCerta = (int)($body->resposta_certa ?? $body->correta ?? 0);

        if (!is_array($opcoes)) $opcoes = [];
        $opcoes = array_values(array_filter(array_map(function($opcao) {
            if (is_object($opcao)) return trim($opcao->texto ?? '');
            if (is_array($opcao)) return trim($opcao['texto'] ?? '');
            return trim((string)$opcao);
        }, $opcoes), fn($texto) => $texto !== ''));

        if ($titulo === '') return resposta('O título da atividade é obrigatório!', 400, false);
        if ($enunciado === '') return resposta('O enunciado da atividade é obrigatório!', 400, false);
        if (count($opcoes) < 2) return resposta('A atividade precisa ter pelo menos duas alternativas!', 400, false);
        if ($respostaCerta < 1 || $respostaCerta > count($opcoes)) return resposta('A resposta correta precisa apontar para a ordem de uma alternativa existente!', 400, false);

        $post = new Post();
        $post->fill($body);
        $post->usuario_id = $usuario->id;
        $post->tipo = 4;
        $post->data_criacao = date('Y-m-d');
        $post->titulo = $titulo;
        $post->insertSelf();

        DB::executar("INSERT INTO atividades (post_id, enunciado, texto, resposta_certa, explicacao) VALUES (?, ?, ?, ?, ?)", [
            $post->id,
            $enunciado,
            $texto,
            $respostaCerta,
            $explicacao
        ]);

        foreach ($opcoes as $index => $textoOpcao) {
            DB::executar("INSERT INTO opcoes (ordem, atividade_id, texto) VALUES (?, ?, ?)", [
                $index + 1,
                $post->id,
                $textoOpcao
            ]);
        }

        $this->salvarCategoriasDoPost($post, $this->normalizarCategorias($body));
        return resposta($this->formatarPost($post, $usuario, true), 201);
    }
}
