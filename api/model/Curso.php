<?php

require_once 'Model.php';

class Curso extends Model {
    protected static $atributos = [];
    public static $tabela = 'cursos';
}

Curso::fetch();