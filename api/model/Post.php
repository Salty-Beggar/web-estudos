<?php

require_once 'Model.php';
require_once 'Categoria.php';

enum PostTipoEnum {
    case Artigo;
    case Atividade;
    case Questionario;
}

class Post extends Model {
    static protected $tabela = 'posts';
    static protected $atributos = [];
    static protected $oneToMany = [
        'comentarios' => ['Comentario', 'post_id']
    ];
    static protected $manyToMany = [
        'categorias' => ['Categoria', 'posts_categorias', 'post_id', 'categoria_id', 'pivotAttributes' => []]
    ];
}

Post::fetch();
