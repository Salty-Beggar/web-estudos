<?php

fetchModel('Post');

class FeedController {
    public function carregarFeed($config = []) {
        $posts = Post::select();
        foreach ($posts as &$post) {
            $post->loadRelation('categorias');
        }
        return resposta($posts);
    }
}