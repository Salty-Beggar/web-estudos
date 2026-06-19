<?php

require_once 'model/Usuario.php';

class UsuarioController {
    public function add($body) {
        $usuario = new Usuario();
        $body->senha = base64_encode($body->senha);
        $usuario->fill($body);
        $usuario->insertSelf();

        return resposta($usuario);
    }
}