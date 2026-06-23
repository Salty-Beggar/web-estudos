<?php

require_once 'Model.php';

class Curso extends Model {
    protected static $atributos = [];
    protected static $tabela = 'cursos';
}

Curso::fetch();