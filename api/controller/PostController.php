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

    function artigo_selectOne($usuario_id, $artigo_id) {
        $post = Post::select('*', "JOIN artigos ON artigos.post_id = posts.id WHERE id = {$artigo_id}", [], ['corpo'])[0];
        $post->loadRelation('categorias');
        return resposta($post);
    }
}