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

    private function booleanDoBody($valor, bool $padrao = false): int {
        if ($valor === null) return $padrao ? 1 : 0;
        if (is_bool($valor)) return $valor ? 1 : 0;
        if (is_numeric($valor)) return ((int)$valor) !== 0 ? 1 : 0;
        if (is_string($valor)) {
            $valor = strtolower(trim($valor));
            if (in_array($valor, ['1', 'true', 'sim', 's', 'yes', 'y', 'publicado'], true)) return 1;
            if (in_array($valor, ['0', 'false', 'nao', 'não', 'n', 'no', 'rascunho', 'privado'], true)) return 0;
        }
        return !empty($valor) ? 1 : 0;
    }

    private function publicadoDoBody($body): int {
        return $this->booleanDoBody($body->publicado ?? $body->postado ?? $body->visivel_no_feed ?? null, false);
    }

    private function alterarPublicacao($usuario, int $postID, int $publicado) {
        if ($postID <= 0) return resposta('ID do post é obrigatório!', 400, false);

        $post = DB::queryAssoc('SELECT id, usuario_id, tipo FROM posts WHERE id = ?', [$postID]);
        if (empty($post)) return resposta('Post não encontrado!', 404, false);
        if ((int)$post[0]['usuario_id'] !== (int)$usuario->id) return resposta('Você só pode alterar publicação de posts seus.', 403, false);

        DB::executar('UPDATE posts SET publicado = ? WHERE id = ?', [$publicado, $postID]);

        if ((int)$post[0]['tipo'] === 1) {
            DB::executar('UPDATE cursos SET publicado = ? WHERE post_id = ?', [$publicado, $postID]);
        }

        $postAtualizado = Post::select('*', ' WHERE id = ?', [$postID])[0] ?? null;
        return resposta($this->formatarPost($postAtualizado, $usuario, true));
    }

    private function usuarioPodeVerPost($post, $usuario): bool {
        if (!$post) return false;
        $postArray = is_object($post) && method_exists($post, 'jsonSerialize') ? $post->jsonSerialize() : (array)$post;
        return !empty($postArray['publicado']) || (int)($postArray['usuario_id'] ?? 0) === (int)$usuario->id;
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

    private function categoriasDoPostArray(int $postID, int $usuarioID) {
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
            $categoria['id'] = (int)($categoria['id'] ?? 0);
            $categoria['votos'] = (int)($categoria['votos'] ?? 0);
            $categoria['voto_usuario'] = (int)($categoria['voto_usuario'] ?? 0);
        }
        return $categorias;
    }

    private function atividadesDaProva(int $provaID) {
        $atividades = DB::queryAssoc(
            "SELECT
                posts.id,
                posts.usuario_id,
                posts.titulo,
                posts.tipo,
                posts.data_criacao,
                atividades.enunciado,
                atividades.texto AS texto_atividade,
                atividades.resposta_certa,
                atividades.explicacao AS explicacao_atividade,
                provas_atividades.ordem
             FROM provas_atividades
             JOIN posts ON posts.id = provas_atividades.atividade_id
             JOIN atividades ON atividades.post_id = posts.id
             WHERE provas_atividades.prova_id = ?
             ORDER BY provas_atividades.ordem ASC, posts.id ASC",
            [$provaID]
        );

        foreach ($atividades as &$atividade) {
            $atividade['id'] = (int)($atividade['id'] ?? 0);
            $atividade['tipo_id'] = 4;
            $atividade['tipo_nome'] = 'atividade';
            $atividade['resposta_certa'] = (int)($atividade['resposta_certa'] ?? 0);
            $atividade['ordem'] = (int)($atividade['ordem'] ?? 0);
            $atividade['opcoes'] = DB::queryAssoc(
                "SELECT id, ordem, texto FROM opcoes WHERE atividade_id = ? ORDER BY ordem ASC",
                [$atividade['id']]
            );
            foreach ($atividade['opcoes'] as &$opcao) {
                $opcao['id'] = (int)($opcao['id'] ?? 0);
                $opcao['ordem'] = (int)($opcao['ordem'] ?? 0);
            }
        }

        return $atividades;
    }

    private function postsDoCurso(int $cursoID) {
        $posts = DB::queryAssoc(
            "SELECT posts.*
             FROM cursos_posts
             JOIN posts ON cursos_posts.post_id = posts.id
             WHERE cursos_posts.curso_id = ?
             ORDER BY posts.tipo ASC, posts.data_criacao DESC, posts.id DESC",
            [$cursoID]
        );

        foreach ($posts as &$postCurso) {
            $postCurso['id'] = (int)($postCurso['id'] ?? 0);
            $postCurso['tipo_id'] = (int)($postCurso['tipo'] ?? 0);
            $postCurso['tipo_nome'] = $this->tipoNome($postCurso['tipo_id']);
            $postCurso['categorias'] = DB::queryAssoc(
                "SELECT categorias.*
                 FROM categorias
                 JOIN posts_categorias ON posts_categorias.categoria_id = categorias.id
                 WHERE posts_categorias.post_id = ?
                 ORDER BY categorias.nome ASC",
                [$postCurso['id']]
            );

            if ($postCurso['tipo_nome'] === 'prova') {
                $config = DB::queryAssoc("SELECT descricao, nota_maxima, formato_nota, mostrar_resultado_imediato, permitir_resposta_nula FROM provas WHERE post_id = ?", [$postCurso['id']]);
                $postCurso['descricao_prova'] = $config[0]['descricao'] ?? '';
                $postCurso['qtd_atividades'] = (int)(DB::queryAssoc("SELECT COUNT(*) AS total FROM provas_atividades WHERE prova_id = ?", [$postCurso['id']])[0]['total'] ?? 0);
            }
        }

        return $posts;
    }

    private function agruparPostsCurso(array $posts) {
        $grupos = [
            'artigos' => [],
            'atividades' => [],
            'provas' => [],
            'questionarios' => [],
            'outros' => []
        ];

        foreach ($posts as $postCurso) {
            $grupo = match ($postCurso['tipo_nome'] ?? $this->tipoNome($postCurso['tipo'] ?? 0)) {
                'artigo' => 'artigos',
                'atividade' => 'atividades',
                'prova' => 'provas',
                'questionario' => 'questionarios',
                default => 'outros'
            };
            $grupos[$grupo][] = $postCurso;
        }

        return $grupos;
    }

    private function formatarPost($post, $usuario, $comDetalhes = false) {
        $postJson = is_object($post) && method_exists($post, 'jsonSerialize') ? $post->jsonSerialize() : (array)$post;
        $postJson['id'] = (int)($postJson['id'] ?? 0);
        $postJson['usuario_id'] = (int)($postJson['usuario_id'] ?? 0);
        $postJson['tipo_id'] = (int)($postJson['tipo'] ?? $postJson['tipo_id'] ?? 0);
        $postJson['tipo'] = $postJson['tipo_id'];
        $postJson['tipo_nome'] = $this->tipoNome($postJson['tipo_id']);
        $postJson['publicado'] = !empty($postJson['publicado']);

        $autor = Usuario::select('*', " WHERE id = ?", [$postJson['usuario_id']])[0] ?? null;
        if ($autor) $autor->senha = null;
        $postJson['usuario'] = $autor;
        $postJson['categorias'] = $this->categoriasDoPostArray($postJson['id'], (int)$usuario->id);

        if ($postJson['tipo_nome'] === 'artigo') {
            $artigo = DB::queryAssoc("SELECT corpo, formato FROM artigos WHERE post_id = ?", [$postJson['id']]);
            $postJson['corpo'] = $artigo[0]['corpo'] ?? '';
            $postJson['formato_artigo'] = $artigo[0]['formato'] ?? 'markdown';
            if (empty($postJson['descricao'])) $postJson['descricao'] = $this->resumoTexto($postJson['corpo']);
        }

        if ($postJson['tipo_nome'] === 'atividade') {
            $atividade = DB::queryAssoc("SELECT enunciado, texto, resposta_certa, explicacao FROM atividades WHERE post_id = ?", [$postJson['id']]);
            $postJson['enunciado'] = $atividade[0]['enunciado'] ?? '';
            $postJson['texto_atividade'] = $atividade[0]['texto'] ?? '';
            $postJson['resposta_certa'] = isset($atividade[0]['resposta_certa']) ? (int)$atividade[0]['resposta_certa'] : null;
            $postJson['explicacao_atividade'] = $atividade[0]['explicacao'] ?? '';
            if (empty($postJson['descricao'])) $postJson['descricao'] = $this->resumoTexto($postJson['texto_atividade'] ?: $postJson['enunciado']);
            if ($comDetalhes) {
                $postJson['opcoes'] = DB::queryAssoc("SELECT id, ordem, texto FROM opcoes WHERE atividade_id = ? ORDER BY ordem", [$postJson['id']]);
            }
        }

        if ($postJson['tipo_nome'] === 'curso') {
            $cursoInfo = DB::queryAssoc("SELECT origem_curso_id FROM cursos WHERE post_id = ?", [$postJson['id']]);
            $cursoInfo = $cursoInfo[0] ?? [];
            $postJson['origem_curso_id'] = isset($cursoInfo['origem_curso_id']) ? ($cursoInfo['origem_curso_id'] === null ? null : (int)$cursoInfo['origem_curso_id']) : null;
            $postJson['proprietario'] = (int)$postJson['usuario_id'] === (int)$usuario->id;
            $origemCursoID = $postJson['origem_curso_id'] ?: $postJson['id'];
            $postJson['curso_salvo'] = $postJson['proprietario'] || !empty($this->usuarioPossuiCopiaCurso((int)$usuario->id, (int)$origemCursoID));

            if ($comDetalhes) {
                $postJson['posts'] = $this->postsDoCurso($postJson['id']);
                $postJson['posts_por_tipo'] = $this->agruparPostsCurso($postJson['posts']);
            }
        }

        if ($postJson['tipo_nome'] === 'prova') {
            $prova = DB::queryAssoc("SELECT descricao, nota_maxima, formato_nota, mostrar_resultado_imediato, permitir_resposta_nula FROM provas WHERE post_id = ?", [$postJson['id']]);
            $config = $prova[0] ?? [];
            $postJson['descricao_prova'] = $config['descricao'] ?? '';
            $postJson['nota_maxima'] = isset($config['nota_maxima']) ? (float)$config['nota_maxima'] : 10.0;
            $postJson['formato_nota'] = $config['formato_nota'] ?? 'dez';
            $postJson['mostrar_resultado_imediato'] = !empty($config['mostrar_resultado_imediato']);
            $postJson['permitir_resposta_nula'] = !empty($config['permitir_resposta_nula']);
            $qtd = DB::queryAssoc("SELECT COUNT(*) AS total FROM provas_atividades WHERE prova_id = ?", [$postJson['id']]);
            $postJson['qtd_atividades'] = (int)($qtd[0]['total'] ?? 0);
            if (empty($postJson['descricao'])) $postJson['descricao'] = $postJson['descricao_prova'];
            if ($comDetalhes) {
                $postJson['atividades'] = $this->atividadesDaProva($postJson['id']);
            }
        }

        if (empty($postJson['descricao'])) $postJson['descricao'] = '';
        return $postJson;
    }

    public function selectAll($usuario) {
        $posts = Post::select('*', " WHERE publicado = 1 ORDER BY data_criacao DESC, id DESC");
        foreach ($posts as &$post) {
            $post = $this->formatarPost($post, $usuario);
        }
        return resposta($posts);
    }

    public function selectOne($usuario, $id) {
        $post = Post::select('*', " WHERE id = ?", [(int)$id])[0] ?? null;
        if (!$post) return resposta('Post não encontrado!', 404, false);
        if (!$this->usuarioPodeVerPost($post, $usuario)) return resposta('Esse post não está publicado.', 403, false);
        return resposta($this->formatarPost($post, $usuario, true));
    }

    public function usuarioVotar($usuario, $body) {
        if (!isset($body->post_id, $body->categoria_id, $body->voto)) {
            return resposta('post_id, categoria_id e voto são obrigatórios!', 400, false);
        }

        $usuario_id = (int)$usuario->id;
        $post_id = (int)$body->post_id;
        $categoria_id = (int)$body->categoria_id;
        $voto = max(-1, min(1, (int)$body->voto));

        $votoAtual = DB::queryAssoc("SELECT * FROM usuarios_posts_categorias WHERE usuario_id = ? AND post_id = ? AND categoria_id = ?", [$usuario_id, $post_id, $categoria_id]);

        if (empty($votoAtual)) {
            DB::executar("INSERT IGNORE INTO usuarios_posts (usuario_id, post_id) VALUES (?, ?)", [$usuario_id, $post_id]);
            DB::executar("INSERT INTO usuarios_posts_categorias (usuario_id, post_id, categoria_id, voto) VALUES (?, ?, ?, 0)", [$usuario_id, $post_id, $categoria_id]);
            $votoAtual = DB::queryAssoc("SELECT * FROM usuarios_posts_categorias WHERE usuario_id = ? AND post_id = ? AND categoria_id = ?", [$usuario_id, $post_id, $categoria_id]);
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
        return $this->selectOne($usuario, $artigo_id);
    }

    function curso_selectOne($usuario, $curso_id) {
        $curso = Post::select('*', " WHERE id = ? AND tipo = 1", [(int)$curso_id])[0] ?? null;
        if (!$curso) return resposta('Curso não encontrado!', 404, false);
        if (!$this->usuarioPodeVerPost($curso, $usuario)) return resposta('Esse curso não está publicado.', 403, false);
        return resposta($this->formatarPost($curso, $usuario, true));
    }

    function prova_selectOne($usuario, $prova_id) {
        $prova = Post::select('*', " WHERE id = ? AND tipo = 5", [(int)$prova_id])[0] ?? null;
        if (!$prova) return resposta('Prova não encontrada!', 404, false);
        if (!$this->usuarioPodeVerPost($prova, $usuario)) return resposta('Essa prova não está publicada.', 403, false);
        return resposta($this->formatarPost($prova, $usuario, true));
    }

    function atividade_selectOne($usuario, $id) {
        $post = Post::select('*', " WHERE id = ? AND tipo = 4", [(int)$id])[0] ?? null;
        if (!$post) return resposta('Atividade não encontrada!', 404, false);
        if (!$this->usuarioPodeVerPost($post, $usuario)) return resposta('Essa atividade não está publicada.', 403, false);
        return resposta($this->formatarPost($post, $usuario, true));
    }

    private function formatarCursoResumo(array $curso, int $usuarioID) {
        $curso['id'] = (int)($curso['id'] ?? 0);
        $curso['usuario_id'] = (int)($curso['usuario_id'] ?? 0);
        $curso['tipo_id'] = 1;
        $curso['tipo_nome'] = 'curso';
        $curso['proprietario'] = $curso['usuario_id'] === $usuarioID;
        $curso['curso_salvo'] = $curso['proprietario'];
        $curso['origem_curso_id'] = isset($curso['origem_curso_id']) ? ($curso['origem_curso_id'] === null ? null : (int)$curso['origem_curso_id']) : null;
        $curso['publicado'] = !empty($curso['publicado']);
        $curso['categorias'] = DB::queryAssoc(
            "SELECT categorias.*
             FROM categorias
             JOIN posts_categorias ON posts_categorias.categoria_id = categorias.id
             WHERE posts_categorias.post_id = ?
             ORDER BY categorias.nome ASC",
            [$curso['id']]
        );
        $totalItens = DB::queryAssoc("SELECT COUNT(*) AS total FROM cursos_posts WHERE curso_id = ?", [$curso['id']]);
        $curso['qtd_itens'] = (int)($totalItens[0]['total'] ?? 0);
        return $curso;
    }

    private function usuarioPossuiCopiaCurso(int $usuarioID, int $origemCursoID) {
        $cursos = DB::queryAssoc(
            "SELECT posts.*, cursos.origem_curso_id
             FROM cursos
             JOIN posts ON posts.id = cursos.post_id
             WHERE posts.tipo = 1
               AND posts.usuario_id = ?
               AND (posts.id = ? OR cursos.origem_curso_id = ?)
             ORDER BY posts.id ASC
             LIMIT 1",
            [$usuarioID, $origemCursoID, $origemCursoID]
        );

        return $cursos[0] ?? null;
    }

    function cursos_favoritos($usuario) {
        return $this->curso_selectUsuario($usuario);
    }

    function curso_selectUsuario($usuario) {
        $cursos = DB::queryAssoc(
            "SELECT posts.id, posts.usuario_id, posts.titulo, posts.tipo, posts.data_criacao, posts.publicado, cursos.origem_curso_id
             FROM posts
             JOIN cursos ON cursos.post_id = posts.id
             WHERE posts.tipo = 1
               AND posts.usuario_id = ?
             ORDER BY posts.titulo ASC, posts.id ASC",
            [(int)$usuario->id]
        );

        foreach ($cursos as &$curso) {
            $curso = $this->formatarCursoResumo($curso, (int)$usuario->id);
        }

        return resposta(['cursos' => $cursos]);
    }

    function curso_salvar($usuario, $body) {
        $cursoID = (int)($body->curso_id ?? $body->id ?? 0);
        if ($cursoID <= 0) return resposta('curso_id é obrigatório!', 400, false);

        $cursoOriginal = DB::queryAssoc(
            "SELECT posts.id, posts.usuario_id, posts.titulo, posts.tipo, posts.data_criacao, posts.publicado, cursos.origem_curso_id
             FROM cursos
             JOIN posts ON posts.id = cursos.post_id
             WHERE cursos.post_id = ? AND posts.tipo = 1",
            [$cursoID]
        );
        if (empty($cursoOriginal)) return resposta('Curso não encontrado!', 404, false);
        $cursoOriginal = $cursoOriginal[0];

        if ((int)$cursoOriginal['usuario_id'] !== (int)$usuario->id && empty($cursoOriginal['publicado'])) {
            return resposta('Esse curso não está publicado para ser salvo.', 403, false);
        }

        if ((int)$cursoOriginal['usuario_id'] === (int)$usuario->id) {
            $post = Post::select('*', " WHERE id = ? AND tipo = 1", [$cursoID])[0] ?? null;
            return resposta($this->formatarPost($post, $usuario, true));
        }

        $origemCursoID = !empty($cursoOriginal['origem_curso_id']) ? (int)$cursoOriginal['origem_curso_id'] : (int)$cursoOriginal['id'];
        $copiaExistente = $this->usuarioPossuiCopiaCurso((int)$usuario->id, $origemCursoID);
        if ($copiaExistente) {
            return resposta($this->formatarPost($copiaExistente, $usuario, true));
        }

        try {
            DB::executar('START TRANSACTION', []);

            DB::executar(
                "INSERT INTO posts (usuario_id, titulo, data_criacao, tipo, publicado) VALUES (?, ?, CURDATE(), 1, 0)",
                [(int)$usuario->id, $cursoOriginal['titulo']]
            );
            $novoCursoID = (int)(DB::queryAssoc('SELECT LAST_INSERT_ID() AS id', [])[0]['id'] ?? 0);
            if ($novoCursoID <= 0) throw new Exception('Não foi possível criar a cópia do curso.');

            DB::executar(
                "INSERT INTO cursos (post_id, origem_curso_id, publicado) VALUES (?, ?, 0)",
                [$novoCursoID, $origemCursoID]
            );

            DB::executar(
                "INSERT IGNORE INTO posts_categorias (post_id, categoria_id, votos)
                 SELECT ?, categoria_id, votos
                 FROM posts_categorias
                 WHERE post_id = ?",
                [$novoCursoID, $cursoID]
            );

            DB::executar(
                "INSERT IGNORE INTO cursos_posts (curso_id, post_id)
                 SELECT ?, cursos_posts.post_id
                 FROM cursos_posts
                 JOIN posts ON posts.id = cursos_posts.post_id
                 WHERE cursos_posts.curso_id = ?
                   AND posts.tipo <> 1",
                [$novoCursoID, $cursoID]
            );

            DB::executar("INSERT IGNORE INTO usuarios_posts (usuario_id, post_id) VALUES (?, ?)", [(int)$usuario->id, $novoCursoID]);
            DB::executar('COMMIT', []);
        } catch (Throwable $e) {
            DB::executar('ROLLBACK', []);
            return resposta('Erro ao salvar curso: ' . $e->getMessage(), 500, false);
        }

        $novoPost = Post::select('*', " WHERE id = ? AND tipo = 1", [$novoCursoID])[0] ?? null;
        return resposta($this->formatarPost($novoPost, $usuario, true), 201);
    }

    function curso_favoritar($usuario, $body) {
        return $this->curso_salvar($usuario, $body);
    }

    function curso_desfavoritar($usuario, $entrada = null) {
        return resposta('A lógica de favoritos foi substituída por Salvar curso. O curso salvo é uma cópia própria do usuário.', 410, false);
    }

    function artigo_criar($usuario, $body) {
        $titulo = trim($body->titulo ?? '');
        $corpo = trim($body->corpo ?? $body->texto ?? '');
        if ($titulo === '') return resposta('O título do artigo é obrigatório!', 400, false);
        if ($corpo === '') return resposta('O texto do artigo é obrigatório!', 400, false);

        $cursoID = (int)($body->curso_id ?? 0);
        if ($cursoID > 0) {
            $validacaoCurso = $this->validarCursoDestinoUsuario($usuario, $cursoID);
            if (!$validacaoCurso['ok']) return resposta($validacaoCurso['mensagem'], $validacaoCurso['codigo'], false);
        }

        $post = new Post();
        $post->usuario_id = $usuario->id;
        $post->tipo = 2;
        $post->data_criacao = date('Y-m-d');
        $post->fill($body);
        $post->titulo = $titulo;
        $post->publicado = $this->publicadoDoBody($body);
        $post->insertSelf();

        DB::executar("INSERT INTO artigos (post_id, corpo, formato) VALUES (?, ?, ?)", [$post->id, $corpo, $body->formato ?? 'markdown']);
        $this->salvarCategoriasDoPost($post, $this->normalizarCategorias($body));

        if ($cursoID > 0) {
            $resultadoCurso = $this->vincularPostCursoUsuario($usuario, $cursoID, (int)$post->id);
            if (!$resultadoCurso['ok']) return resposta($resultadoCurso['mensagem'], $resultadoCurso['codigo'], false);
        }

        return resposta($this->formatarPost($post, $usuario, true), 201);
    }

    function curso_criar($usuario, $body) {
        $titulo = trim($body->titulo ?? '');
        if ($titulo === '') return resposta('O título do curso é obrigatório!', 400, false);

        $post = new Post();
        $post->usuario_id = $usuario->id;
        $post->tipo = 1;
        $post->data_criacao = date('Y-m-d');
        $post->fill($body);
        $post->titulo = $titulo;
        $post->publicado = $this->publicadoDoBody($body);
        $post->insertSelf();

        DB::executar("INSERT INTO cursos (post_id, origem_curso_id, publicado) VALUES (?, NULL, ?)", [(int)$post->id, (int)$post->publicado]);
        $this->salvarCategoriasDoPost($post, $this->normalizarCategorias($body));
        DB::executar("INSERT IGNORE INTO usuarios_posts (usuario_id, post_id) VALUES (?, ?)", [(int)$usuario->id, (int)$post->id]);
        return resposta($this->formatarPost($post, $usuario, true), 201);
    }

    private function validarCursoDestinoUsuario($usuario, int $curso_id): array {
        if ($curso_id <= 0) return ['ok' => true, 'codigo' => 200, 'mensagem' => 'Sem curso para validar.'];

        $curso = DB::queryAssoc(
            "SELECT posts.id, posts.usuario_id
             FROM cursos
             JOIN posts ON posts.id = cursos.post_id
             WHERE cursos.post_id = ?",
            [$curso_id]
        );
        if (empty($curso)) return ['ok' => false, 'codigo' => 404, 'mensagem' => 'Curso não encontrado!'];
        if ((int)$curso[0]['usuario_id'] !== (int)$usuario->id) {
            return ['ok' => false, 'codigo' => 403, 'mensagem' => 'Esse curso não pertence ao usuário logado.'];
        }

        return ['ok' => true, 'codigo' => 200, 'mensagem' => 'Curso válido.'];
    }

    private function vincularPostCursoUsuario($usuario, int $curso_id, int $post_id): array {
        if ($curso_id <= 0 || $post_id <= 0) {
            return ['ok' => false, 'codigo' => 400, 'mensagem' => 'curso_id e post_id são obrigatórios!'];
        }

        $curso = DB::queryAssoc(
            "SELECT posts.id, posts.usuario_id
             FROM cursos
             JOIN posts ON posts.id = cursos.post_id
             WHERE cursos.post_id = ?",
            [$curso_id]
        );
        if (empty($curso)) return ['ok' => false, 'codigo' => 404, 'mensagem' => 'Curso não encontrado!'];
        if ((int)$curso[0]['usuario_id'] !== (int)$usuario->id) {
            return ['ok' => false, 'codigo' => 403, 'mensagem' => 'Esse curso não pertence ao usuário logado.'];
        }

        $post = DB::queryAssoc("SELECT id, tipo FROM posts WHERE id = ?", [$post_id]);
        if (empty($post)) return ['ok' => false, 'codigo' => 404, 'mensagem' => 'Post não encontrado!'];
        if ((int)$post[0]['tipo'] === 1) {
            return ['ok' => false, 'codigo' => 400, 'mensagem' => 'Não dá para adicionar um curso dentro de outro curso.'];
        }

        DB::executar("INSERT IGNORE INTO cursos_posts (curso_id, post_id) VALUES (?, ?)", [$curso_id, $post_id]);
        return ['ok' => true, 'codigo' => 200, 'mensagem' => 'Post adicionado ao curso com sucesso!'];
    }

    function curso_addPost($usuario, $body) {
        $resultado = $this->vincularPostCursoUsuario($usuario, (int)($body->curso_id ?? 0), (int)($body->post_id ?? 0));
        if (!$resultado['ok']) return resposta($resultado['mensagem'], $resultado['codigo'], false);
        return resposta($resultado['mensagem']);
    }

    function prova_selectUsuario($usuario) {
        $provas = DB::queryAssoc(
            "SELECT posts.*
             FROM posts
             JOIN provas ON provas.post_id = posts.id
             WHERE posts.tipo = 5
               AND posts.usuario_id = ?
             ORDER BY posts.titulo ASC, posts.id ASC",
            [(int)$usuario->id]
        );

        foreach ($provas as &$prova) {
            $prova = $this->formatarPost($prova, $usuario);
        }

        return resposta(['provas' => $provas]);
    }

    function prova_criar($usuario, $body) {
        $titulo = trim($body->titulo ?? '');
        if ($titulo === '') return resposta('O título da prova é obrigatório!', 400, false);

        $descricao = trim($body->descricao ?? $body->descricao_prova ?? '');
        $notaMaxima = (float)($body->nota_maxima ?? 10);
        if ($notaMaxima <= 0) $notaMaxima = 10;
        $formatoNota = ($body->formato_nota ?? 'dez') === 'porcentagem' ? 'porcentagem' : 'dez';
        $mostrarResultadoImediato = !isset($body->mostrar_resultado_imediato) || !empty($body->mostrar_resultado_imediato);
        $permitirRespostaNula = !isset($body->permitir_resposta_nula) || !empty($body->permitir_resposta_nula);

        $cursoID = (int)($body->curso_id ?? 0);
        if ($cursoID > 0) {
            $validacaoCurso = $this->validarCursoDestinoUsuario($usuario, $cursoID);
            if (!$validacaoCurso['ok']) return resposta($validacaoCurso['mensagem'], $validacaoCurso['codigo'], false);
        }

        $post = new Post();
        $post->usuario_id = $usuario->id;
        $post->tipo = 5;
        $post->data_criacao = date('Y-m-d');
        $post->fill($body);
        $post->titulo = $titulo;
        $post->publicado = $this->publicadoDoBody($body);
        $post->insertSelf();

        DB::executar(
            "INSERT INTO provas (post_id, descricao, nota_maxima, formato_nota, mostrar_resultado_imediato, permitir_resposta_nula) VALUES (?, ?, ?, ?, ?, ?)",
            [$post->id, $descricao, $notaMaxima, $formatoNota, $mostrarResultadoImediato ? 1 : 0, $permitirRespostaNula ? 1 : 0]
        );

        $this->salvarCategoriasDoPost($post, $this->normalizarCategorias($body));

        $atividades = $body->atividades ?? [];
        if (is_array($atividades)) {
            foreach ($atividades as $index => $atividadeID) {
                $this->vincularAtividadeProva((int)$post->id, (int)$atividadeID, $index + 1);
            }
        }

        if ($cursoID > 0) {
            $resultadoCurso = $this->vincularPostCursoUsuario($usuario, $cursoID, (int)$post->id);
            if (!$resultadoCurso['ok']) return resposta($resultadoCurso['mensagem'], $resultadoCurso['codigo'], false);
        }

        return resposta($this->formatarPost($post, $usuario, true), 201);
    }

    private function vincularAtividadeProva(int $provaID, int $atividadeID, ?int $ordem = null) {
        $atividade = DB::queryAssoc("SELECT id FROM posts WHERE id = ? AND tipo = 4", [$atividadeID]);
        if (empty($atividade)) return false;

        if ($ordem === null || $ordem <= 0) {
            $ultimo = DB::queryAssoc("SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima FROM provas_atividades WHERE prova_id = ?", [$provaID]);
            $ordem = (int)($ultimo[0]['proxima'] ?? 1);
        }

        DB::executar("INSERT IGNORE INTO provas_atividades (prova_id, atividade_id, ordem) VALUES (?, ?, ?)", [$provaID, $atividadeID, $ordem]);
        return true;
    }

    function prova_addAtividade($usuario, $body) {
        $provaID = (int)($body->prova_id ?? 0);
        $atividadeID = (int)($body->atividade_id ?? $body->post_id ?? 0);
        if ($provaID <= 0 || $atividadeID <= 0) return resposta('prova_id e atividade_id são obrigatórios!', 400, false);

        $prova = DB::queryAssoc(
            "SELECT posts.id, posts.usuario_id
             FROM provas
             JOIN posts ON posts.id = provas.post_id
             WHERE provas.post_id = ?",
            [$provaID]
        );
        if (empty($prova)) return resposta('Prova não encontrada!', 404, false);
        if ((int)$prova[0]['usuario_id'] !== (int)$usuario->id) return resposta('Essa prova não pertence ao usuário logado.', 403, false);

        $atividade = DB::queryAssoc("SELECT id FROM posts WHERE id = ? AND tipo = 4", [$atividadeID]);
        if (empty($atividade)) return resposta('Atividade não encontrada!', 404, false);

        $this->vincularAtividadeProva($provaID, $atividadeID);
        return resposta('Atividade adicionada à prova com sucesso!');
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

        $cursoID = (int)($body->curso_id ?? 0);
        if ($cursoID > 0) {
            $validacaoCurso = $this->validarCursoDestinoUsuario($usuario, $cursoID);
            if (!$validacaoCurso['ok']) return resposta($validacaoCurso['mensagem'], $validacaoCurso['codigo'], false);
        }

        $post = new Post();
        $post->fill($body);
        $post->usuario_id = $usuario->id;
        $post->tipo = 4;
        $post->data_criacao = date('Y-m-d');
        $post->titulo = $titulo;
        $post->publicado = $this->publicadoDoBody($body);
        $post->insertSelf();

        DB::executar("INSERT INTO atividades (post_id, enunciado, texto, resposta_certa, explicacao) VALUES (?, ?, ?, ?, ?)", [
            $post->id,
            $enunciado,
            $texto,
            $respostaCerta,
            $explicacao
        ]);

        foreach ($opcoes as $index => $textoOpcao) {
            DB::executar("INSERT INTO opcoes (ordem, atividade_id, texto) VALUES (?, ?, ?)", [$index + 1, $post->id, $textoOpcao]);
        }

        $this->salvarCategoriasDoPost($post, $this->normalizarCategorias($body));

        $provaID = (int)($body->prova_id ?? 0);
        if ($provaID > 0) $this->vincularAtividadeProva($provaID, (int)$post->id);

        if ($cursoID > 0) {
            $resultadoCurso = $this->vincularPostCursoUsuario($usuario, $cursoID, (int)$post->id);
            if (!$resultadoCurso['ok']) return resposta($resultadoCurso['mensagem'], $resultadoCurso['codigo'], false);
        }

        return resposta($this->formatarPost($post, $usuario, true), 201);
    }


    function publicar($usuario, $body, $id) {
        return $this->alterarPublicacao($usuario, (int)$id, 1);
    }

    function despublicar($usuario, $body, $id) {
        return $this->alterarPublicacao($usuario, (int)$id, 0);
    }
}
