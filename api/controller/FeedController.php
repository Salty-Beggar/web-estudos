<?php

require_once 'model/Post.php';

class FeedController {
    public function carregarFeed($config = []) {

        $posts = Post::select();

        // echo '<br>';
        // echo '<br>';
        foreach ($posts as &$post) {
            $post->loadRelation('categorias');
        }

        // echo '<br>';
        // echo '<br>';
        // var_dump($posts);
        return resposta($posts);
    }
}