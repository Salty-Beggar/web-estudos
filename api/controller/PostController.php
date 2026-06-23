<?php

require_once 'model/Post.php';

class PostController {
    public function usuarioVotar($usuario, $body) {
        $usuario_id = $usuario->id;
        $post_id = $body->post_id;
        $categoria_id = $body->categoria_id;

        $votoAtual = DB::queryAssoc("SELECT * FROM usuarios_posts_categorias WHERE
        usuario_id = {$usuario_id}
            AND post_id = ?
            AND categoria_id = ?
        ", [$post_id, $categoria_id]);

        if (empty($votoAtual)) {
            DB::executar("INSERT INTO usuarios_posts_categorias (usuario_id, post_id, categoria_id) VALUES ({$usuario_id}, {$post_id}, {$categoria_id})", []);
            $votoAtual = DB::queryAssoc("SELECT * FROM usuarios_posts_categorias WHERE
            usuario_id = {$usuario_id}
            AND post_id = ?
            AND categoria_id = ?
            ", [$post_id, $categoria_id]);
        }
        $votoAtual = $votoAtual[0];

        $post_categoria = DB::queryAssoc("SELECT * FROM posts_categorias WHERE
        post_id = ?
        AND categoria_id = ?
        ", [$post_id, $categoria_id]);

        if (empty($post_categoria)) {
            DB::executar("INSERT INTO posts_categorias (post_id, categoria_id) VALUES ({$post_id}, {$categoria_id})", []);
            $post_categoria = DB::queryAssoc("SELECT * FROM posts_categorias WHERE
            post_id = {$post_id}
            AND categoria_id = {$categoria_id}
            ", []);
        }
        $post_categoria = $post_categoria[0];
        $votoDiff = $body->voto - $votoAtual['voto'];

        DB::executar("UPDATE usuarios_posts_categorias SET voto = {$body->voto} WHERE usuario_id = {$usuario_id} AND post_id = {$post_id} AND categoria_id = {$categoria_id}", []);

        DB::executar("UPDATE posts_categorias SET votos = votos + {$votoDiff} WHERE post_id = {$post_id} AND categoria_id = {$categoria_id}", []);

        return resposta('Voto bem sucedido!');
    }

    // Artigo
    function artigo_selectOne($usuario, $artigo_id) {
        $post = Post::select('*', " JOIN artigos ON artigos.post_id = posts.id WHERE id = {$artigo_id}", [], ['corpo'])[0];
        $post->loadRelation('categorias');
        return resposta($post);
    }

    function artigo_criar($usuario, $body) {
        $post = new Post();
        $artigo = new Artigo(); // OBS: Criar essa classe!
        $post->usuario_id = $usuario->id;
        $post->tipo = 1;
        $post->fill($body);
        $artigo->fill($body);
        DB::beginTransaction(); // OBS: Criar essas funções de transaction e tals
        try {
            $post->insertSelf();
            $artigo->insertSelf();
            DB::commit();
        }catch (\Throwable $e) {
            DB::rollback();
            throw $e;
        }
        return resposta([...$post->jsonSerialize(), ...$artigo->jsonSerialize()]);
    }

    // Curso
    function curso_selectOne($usuario, $curso_id) {
        $curso = Post::select('*', " WHERE id = {$curso_id}")[0];
        $curso = $curso->jsonSerialize();
        $curso['posts'] = DB::queryAssoc("SELECT * FROM cursos_posts JOIN posts ON cursos_posts.post_id = posts.id WHERE curso_id = {$curso->id}", []);
        return resposta($curso);
    }

    function curso_criar($usuario, $body) {
        $post = new Post();
        $curso = new Curso(); // OBS: Criar essa classe!
        $post->usuario_id = $usuario->id;
        $post->tipo = 2;
        $post->fill($body);
        $curso->fill($body);
        DB::beginTransaction(); // OBS: Criar essas funções de transaction e tals
        try {
            $post->insertSelf();
            $curso->insertSelf();
            DB::commit();
        }catch (\Throwable $e) {
            DB::rollback();
            throw $e;
        }
        return resposta([...$post->jsonSerialize(), ...$curso->jsonSerialize()]);
    }

    function curso_addPost($usuario, $body) {
        $curso_id = $body['curso_id'];
        $post_id = $body['post_id'];
        if (empty(DB::queryAssoc("SELECT * FROM cursos_posts WHERE curso_id = {$curso_id} AND post_id = {$post_id}", []))) {
            DB::executar("INSERT INTO cursos_posts (curso_id, post_id) VALUES ({$curso_id}, {$post_id})", []);
        }
        return resposta("Post adicionado ao curso com sucesso!");
    }

    function curso_selectUsuario($usuario) {
        $cursos = Post::select('*', " WHERE usuario_id = {$usuario->id} AND tipo = 2");
        return resposta($cursos);
    }
}