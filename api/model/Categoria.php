<?php

require_once 'Model.php';

class Categoria extends Model {
    protected static $atributos = [];
    public static $tabela = 'categorias';
}

Categoria::fetch();