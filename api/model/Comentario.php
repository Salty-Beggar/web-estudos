<?php

class Comentario extends Model {
    public static $tabela = 'comentarios';
    static protected $relManyToOne = [
        ['Post', 'post_id']
    ];
}

Comentario::fetch();
