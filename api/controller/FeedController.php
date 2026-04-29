<?php

fetchModel('Post');

class FeedController {
    public function carregarFeed($config = []) {
        echo Post::select();
    }
}