<?php

require_once 'Model.php';

class Artigo extends Model {
    protected static $atributos = [];
    public static $tabela = 'artigos';
}

Artigo::fetch();