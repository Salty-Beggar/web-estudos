<?php

require_once 'Model.php';
require_once 'Categoria.php';

class Feed extends Model {
    static protected $tabela = 'feeds';
    static protected $atributos = [];
    static protected $oneToMany = [
    ];
    static protected $manyToMany = [
        'categorias' => ['Categoria', 'feeds_categorias', 'post_id', 'categoria_id', 'pivotAttributes' => []]
    ];
}

Feed::fetch();