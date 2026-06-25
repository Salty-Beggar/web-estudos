<?php

require_once 'model/Post.php';
require_once 'model/Feed.php';
require_once 'model/Usuario.php';
require_once 'model/Categoria.php';

class FeedController {
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

    private function categoriasDoFeed(int $feedID) {
        return DB::queryAssoc(
            "SELECT categorias.*
             FROM categorias
             JOIN feeds_categorias ON feeds_categorias.categoria_id = categorias.id
             WHERE feeds_categorias.feed_id = ?
             ORDER BY categorias.nome ASC",
            [$feedID]
        );
    }

    private function categoriasDoPost(int $postID, int $usuarioID) {
        $categorias = DB::queryAssoc(
            "SELECT
                categorias.*,
                posts_categorias.votos,
                COALESCE(usuarios_posts_categorias.voto, 0) AS voto_usuario
             FROM categorias
             JOIN posts_categorias ON posts_categorias.categoria_id = categorias.id
             LEFT JOIN usuarios_posts_categorias
                ON usuarios_posts_categorias.post_id = posts_categorias.post_id
                AND usuarios_posts_categorias.categoria_id = posts_categorias.categoria_id
                AND usuarios_posts_categorias.usuario_id = ?
             WHERE posts_categorias.post_id = ?
             ORDER BY posts_categorias.votos DESC, categorias.nome ASC",
            [$usuarioID, $postID]
        );

        foreach ($categorias as &$categoria) {
            $categoria['id'] = (int)$categoria['id'];
            $categoria['votos'] = (int)($categoria['votos'] ?? 0);
            $categoria['voto_usuario'] = (int)($categoria['voto_usuario'] ?? 0);
        }

        return $categorias;
    }

    private function formatarFeed($feed) {
        $feedJson = is_object($feed) && method_exists($feed, 'jsonSerialize') ? $feed->jsonSerialize() : (array)$feed;
        $feedJson['id'] = (int)($feedJson['id'] ?? 0);
        $feedJson['usuario_id'] = (int)($feedJson['usuario_id'] ?? 0);
        $feedJson['categorias'] = $this->categoriasDoFeed($feedJson['id']);
        return $feedJson;
    }

    private function formatarPost($post, $usuario) {
        $postJson = is_object($post) && method_exists($post, 'jsonSerialize') ? $post->jsonSerialize() : (array)$post;
        $postID = (int)($postJson['id'] ?? 0);
        $usuarioID = (int)($usuario->id ?? 0);

        $postJson['id'] = $postID;
        $postJson['usuario_id'] = (int)($postJson['usuario_id'] ?? 0);
        $postJson['tipo_id'] = (int)($postJson['tipo'] ?? $postJson['tipo_id'] ?? 0);
        $postJson['tipo_nome'] = $this->tipoNome($postJson['tipo_id']);

        $autor = Usuario::select('*', " WHERE id = ?", [$postJson['usuario_id']])[0] ?? null;
        if ($autor) {
            $autorJson = $autor->jsonSerialize();
            $autorJson['senha'] = null;
            $postJson['usuario'] = $autorJson;
        } else {
            $postJson['usuario'] = [
                'id' => null,
                'nome' => 'Usuário',
                'foto' => '/assets/imgs/users/guest_user.svg'
            ];
        }

        $postJson['categorias'] = $this->categoriasDoPost($postID, $usuarioID);

        if ($postJson['tipo_nome'] === 'artigo') {
            $artigo = DB::queryAssoc("SELECT corpo FROM artigos WHERE post_id = ?", [$postID]);
            $postJson['descricao'] = $this->resumoTexto($artigo[0]['corpo'] ?? '');
        }

        if ($postJson['tipo_nome'] === 'atividade') {
            $atividade = DB::queryAssoc("SELECT enunciado, texto FROM atividades WHERE post_id = ?", [$postID]);
            $postJson['enunciado'] = $atividade[0]['enunciado'] ?? '';
            $postJson['texto_atividade'] = $atividade[0]['texto'] ?? '';
            $postJson['descricao'] = $this->resumoTexto($postJson['texto_atividade'] ?: $postJson['enunciado']);
        }

        if (empty($postJson['descricao'])) {
            $postJson['descricao'] = '';
        }

        return $postJson;
    }

    public function carregarFeed($usuario, $feedID, $pesquisa = "") {
        $feedID = (int)$feedID;
        $feed = Feed::select('*', " WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed inválido ou não pertence ao usuário logado!', 403, false);

        $feedCategorias = DB::queryAssoc("SELECT categoria_id FROM feeds_categorias WHERE feed_id = ?", [$feedID]);
        $feedCategorias = array_values(array_unique(array_map(fn($linha) => (int)$linha['categoria_id'], $feedCategorias)));

        if (empty($feedCategorias)) return resposta([]);

        $placeholders = implode(',', array_fill(0, count($feedCategorias), '?'));
        $pesquisa = '%' . trim((string)$pesquisa) . '%';

        $posts = Post::select(
            'posts.*, rank_feed.pontuacao_feed',
            "JOIN (
                SELECT post_id, SUM(votos) AS pontuacao_feed
                FROM posts_categorias
                WHERE categoria_id IN ({$placeholders})
                GROUP BY post_id
            ) AS rank_feed ON rank_feed.post_id = posts.id
            WHERE posts.titulo LIKE ?
            ORDER BY rank_feed.pontuacao_feed DESC, posts.data_criacao DESC, posts.id DESC",
            [...$feedCategorias, $pesquisa],
            ['pontuacao_feed']
        );

        foreach ($posts as &$post) {
            $post = $this->formatarPost($post, $usuario);
        }

        return resposta($posts);
    }

    public function select($usuario) {
        $feeds = Feed::select('*', " WHERE usuario_id = ? ORDER BY id ASC", [$usuario->id]);
        foreach ($feeds as &$feed) {
            $feed = $this->formatarFeed($feed);
        }
        return resposta($feeds);
    }

    public function add($usuario, $body) {
        $titulo = trim($body->titulo ?? '');
        if ($titulo === '') return resposta('O título do feed é obrigatório!', 400, false);

        $categorias = $this->normalizarCategorias($body);
        if (empty($categorias)) return resposta('Selecione pelo menos uma categoria para o feed!', 400, false);

        foreach ($categorias as $categoriaID) {
            $categoria = Categoria::select('id', " WHERE id = ?", [$categoriaID])[0] ?? null;
            if (!$categoria) return resposta("Categoria {$categoriaID} não existe!", 400, false);
        }

        $body->titulo = $titulo;
        $body->descricao = trim($body->descricao ?? '');
        $body->categorias = $categorias;

        $feed = new Feed();
        $feed->fill($body);
        $feed->usuario_id = $usuario->id;
        $feed->fillRelations($body);
        $feed->insertSelf();
        $feed->saveRelations('categorias');

        return resposta($this->formatarFeed($feed), 201);
    }

    public function update($usuario, $body) {
        if (empty($body->id)) return resposta('ID do feed é obrigatório!', 400, false);

        $feed = Feed::select('*', " WHERE id = ? AND usuario_id = ?", [(int)$body->id, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed não encontrado!', 404, false);

        if (isset($body->titulo)) $feed->titulo = trim($body->titulo);
        if (isset($body->descricao)) $feed->descricao = trim($body->descricao);
        if (empty($feed->titulo)) return resposta('O título do feed é obrigatório!', 400, false);

        Feed::update($feed->converterJson(false, false));
        return resposta($this->formatarFeed($feed));
    }

    public function delete($usuario, $id = null) {
        if (empty($id)) return resposta('ID do feed é obrigatório!', 400, false);
        $feedID = (int)$id;

        $feed = Feed::select('id', " WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed não encontrado!', 404, false);

        DB::executar("DELETE FROM feeds_categorias WHERE feed_id = ?", [$feedID]);
        DB::executar("DELETE FROM feeds WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id]);
        return resposta('Feed removido com sucesso!');
    }

    public function addCategoria($usuario, $body, $id, $categoriaID) {
        $feedID = (int)$id;
        $categoriaID = (int)$categoriaID;

        $feed = Feed::select('*', " WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed não encontrado!', 404, false);

        $categoria = Categoria::select('id', " WHERE id = ?", [$categoriaID])[0] ?? null;
        if (!$categoria) return resposta('Categoria não encontrada!', 404, false);

        DB::executar("INSERT IGNORE INTO feeds_categorias (feed_id, categoria_id) VALUES (?, ?)", [$feedID, $categoriaID]);
        return resposta($this->formatarFeed($feed));
    }

    public function deleteCategoria($usuario, $feedID = null, $categoriaID = null) {
        if (empty($feedID) || empty($categoriaID)) {
            return resposta('feed_id e categoria_id são obrigatórios!', 400, false);
        }

        $feedID = (int)$feedID;
        $categoriaID = (int)$categoriaID;
        $feed = Feed::select('id', " WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed não encontrado!', 404, false);

        $totalCategorias = DB::queryAssoc("SELECT COUNT(*) AS total FROM feeds_categorias WHERE feed_id = ?", [$feedID]);
        if ((int)($totalCategorias[0]['total'] ?? 0) <= 1) {
            return resposta('O feed precisa ficar com pelo menos uma categoria!', 400, false);
        }

        DB::executar("DELETE FROM feeds_categorias WHERE feed_id = ? AND categoria_id = ?", [$feedID, $categoriaID]);
        return resposta('Categoria removida do feed com sucesso!');
    }
}
