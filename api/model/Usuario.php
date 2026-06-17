<?php

require_once 'Model.php';

class Usuario extends Model {
    static protected $tabela = 'usuarios';
    static protected $atributos = [];
}

Usuario::fetch();
