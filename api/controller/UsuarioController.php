<?php

require_once 'model/Usuario.php';

class UsuarioController {
    public function add($body) {
        $usuario = new Usuario();
        $usuario->fill($body);
        $usuario->insertSelf();

        return resposta($usuario);
    }
}