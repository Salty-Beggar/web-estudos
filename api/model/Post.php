<?php

require_once 'Model.php';

class Post extends Model {
    static protected $tabela = 'posts';
    static protected $oneToMany = [
        'comentarios' => ['Comentario', 'post_id']
    ];
    static protected $manyToMany = [
        'categorias' => ['Categoria', 'posts_categorias', 'post_id', 'categoria_id']
    ];
}