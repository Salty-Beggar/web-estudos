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
            5 => 'prova',
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

    private function normalizarUltimoFeedAtivo(int $usuarioID): ?int {
        $feeds = DB::queryAssoc(
            "SELECT id, ultimo_feed_ativo FROM feeds WHERE usuario_id = ? ORDER BY id ASC",
            [$usuarioID]
        );

        if (empty($feeds)) return null;

        $ativos = array_values(array_filter($feeds, fn($feed) => !empty($feed['ultimo_feed_ativo'])));
        $ativoID = count($ativos) > 0 ? (int)$ativos[0]['id'] : (int)$feeds[0]['id'];

        if (count($ativos) !== 1 || count($feeds) > 1) {
            DB::executar(
                "UPDATE feeds SET ultimo_feed_ativo = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE usuario_id = ?",
                [$ativoID, $usuarioID]
            );
        }

        return $ativoID;
    }

    private function marcarUltimoFeedAtivo(int $usuarioID, int $feedID): void {
        DB::executar(
            "UPDATE feeds SET ultimo_feed_ativo = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE usuario_id = ?",
            [$feedID, $usuarioID]
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
        $feedJson['ultimo_feed_ativo'] = !empty($feedJson['ultimo_feed_ativo']);
        $feedJson['categorias'] = $this->categoriasDoFeed($feedJson['id']);
        $feedJson['sem_filtro'] = count($feedJson['categorias']) === 0;
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
        $postJson['publicado'] = !empty($postJson['publicado']);

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

        if ($postJson['tipo_nome'] === 'prova') {
            $prova = DB::queryAssoc("SELECT descricao FROM provas WHERE post_id = ?", [$postID]);
            $total = DB::queryAssoc("SELECT COUNT(*) AS total FROM provas_atividades WHERE prova_id = ?", [$postID]);
            $postJson['descricao_prova'] = $prova[0]['descricao'] ?? '';
            $postJson['qtd_atividades'] = (int)($total[0]['total'] ?? 0);
            $postJson['descricao'] = $this->resumoTexto($postJson['descricao_prova'] ?: "Prova com {$postJson['qtd_atividades']} atividades.");
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
        $this->marcarUltimoFeedAtivo((int)$usuario->id, $feedID);

        $feedCategorias = DB::queryAssoc("SELECT categoria_id FROM feeds_categorias WHERE feed_id = ?", [$feedID]);
        $feedCategorias = array_values(array_unique(array_map(fn($linha) => (int)$linha['categoria_id'], $feedCategorias)));

        $pesquisaTexto = trim((string)$pesquisa);
        $pesquisaLike = '%' . $pesquisaTexto . '%';

        if (empty($feedCategorias)) {
            // Feed sem filtro: não faz JOIN obrigatório com categorias.
            // Funciona como um SELECT geral de posts, só aplicando pesquisa se houver texto.
            $posts = DB::queryAssoc(
                "SELECT posts.*, 0 AS pontuacao_feed
                 FROM posts
                 WHERE posts.publicado = 1
                   AND (? = '' OR posts.titulo LIKE ?)
                 ORDER BY posts.data_criacao DESC, posts.id DESC",
                [$pesquisaTexto, $pesquisaLike]
            );
        } else {
            $placeholders = implode(',', array_fill(0, count($feedCategorias), '?'));
            $posts = DB::queryAssoc(
                "SELECT posts.*, rank_feed.pontuacao_feed
                 FROM posts
                 JOIN (
                    SELECT post_id, SUM(votos) AS pontuacao_feed
                    FROM posts_categorias
                    WHERE categoria_id IN ({$placeholders})
                    GROUP BY post_id
                 ) AS rank_feed ON rank_feed.post_id = posts.id
                 WHERE posts.publicado = 1
                   AND (? = '' OR posts.titulo LIKE ?)
                 ORDER BY rank_feed.pontuacao_feed DESC, posts.data_criacao DESC, posts.id DESC",
                [...$feedCategorias, $pesquisaTexto, $pesquisaLike]
            );
        }

        foreach ($posts as &$post) {
            $post = $this->formatarPost($post, $usuario);
        }

        return resposta(['posts' => $posts]);
    }

    public function select($usuario) {
        $this->normalizarUltimoFeedAtivo((int)$usuario->id);
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
        $this->marcarUltimoFeedAtivo((int)$usuario->id, (int)$feed->id);
        $feed->ultimo_feed_ativo = 1;

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

    public function definirAtivo($usuario, $body, $id = null) {
        $feedID = (int)($id ?? $body->id ?? $body->feed_id ?? 0);
        if ($feedID <= 0) return resposta('ID do feed é obrigatório!', 400, false);

        $feed = Feed::select('*', " WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed não encontrado!', 404, false);

        $this->marcarUltimoFeedAtivo((int)$usuario->id, $feedID);
        $feed->ultimo_feed_ativo = 1;

        return resposta($this->formatarFeed($feed));
    }

    public function delete($usuario, $id = null) {
        if (empty($id)) return resposta('ID do feed é obrigatório!', 400, false);
        $feedID = (int)$id;

        $feed = Feed::select('id', " WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id])[0] ?? null;
        if (!$feed) return resposta('Feed não encontrado!', 404, false);

        DB::executar("DELETE FROM feeds_categorias WHERE feed_id = ?", [$feedID]);
        DB::executar("DELETE FROM feeds WHERE id = ? AND usuario_id = ?", [$feedID, $usuario->id]);
        $this->normalizarUltimoFeedAtivo((int)$usuario->id);
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

        DB::executar("DELETE FROM feeds_categorias WHERE feed_id = ? AND categoria_id = ?", [$feedID, $categoriaID]);
        return resposta('Categoria removida do feed com sucesso!');
    }
}
