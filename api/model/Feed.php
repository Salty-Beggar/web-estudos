<?php

require_once 'Model.php';

class Feed extends Model {
    static protected $tabela = 'feeds';
    static protected $atributos = [];
    static protected $manyToMany = [
        'categorias' => ['Categoria', 'posts_categorias', 'feed_id', 'categoria_id']
    ];
}