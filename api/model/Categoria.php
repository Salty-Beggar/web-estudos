<?php

require_once 'Model.php';

class Categoria extends Model {
    protected static $atributos = [];
    protected static $tabela = 'categorias';
}

Categoria::fetch();