<?php

fetchModel('Post');

class FeedController {
    public function carregarFeed($config = []) {
        $posts = Post::select();
        echo json_encode($posts);
    }
}