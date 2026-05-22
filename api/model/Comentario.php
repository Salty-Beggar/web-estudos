<?php

class Comentario extends Model {
    static protected $tabela = 'comentarios';
    static protected $relManyToOne = [
        ['Post', 'post_id']
    ];
}

Comentario::fetch();
