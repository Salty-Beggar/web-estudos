<?php

require_once 'Model.php';

class Usuario extends Model {
    public static $tabela = 'usuarios';
    static protected $atributos = [];
    static protected $oneToMany = [
        'feeds' => ['Feed', 'usuario_id']
    ];
    static protected $manyToMany = [
        'amigos' => ['Usuario', 'usuarios_amigos', 'usuario_id', 'amigo_id', 'pivotAttributes' => []]
    ];
    static protected $nonFillable = [
        // 'senha'
    ];
}

Usuario::fetch();
