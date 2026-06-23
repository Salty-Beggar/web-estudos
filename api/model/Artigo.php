<?php

require_once 'Model.php';

class Artigo extends Model {
    protected static $atributos = [];
    protected static $tabela = 'artigos';
}

Artigo::fetch();