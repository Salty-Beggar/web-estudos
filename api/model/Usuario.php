<?php

require_once 'Model.php';

class Usuario extends Model {
    static protected $tabela = 'usuarios';
    static protected $atributos = [];
    static protected $oneToMany = [
        'feeds' => ['Feed', 'usuario_id']
    ];
    static protected $manyToMany = [
        'categorias' => ['Categoria', 'posts_categorias', 'feed_id', 'categoria_id']
    ];
}

Usuario::fetch();
