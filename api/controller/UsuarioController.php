<?php

require_once 'model/Usuario.php';

class UsuarioController {
    public function add() {
        $json = null; // OBS: Botar o post do php aqui.
        $usuario = new Usuario();
        $usuario->fill($json);
        $usuario->insert();

        return resposta($usuario);
    }
}