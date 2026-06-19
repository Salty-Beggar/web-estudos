<?php

require_once 'model/Usuario.php';

class UsuarioController {
    public function add($body) {
        $usuario = new Usuario();
        $body->senha = base64_encode($body->senha);
        if (!empty(Usuario::select('nome', " WHERE nome = \"{$body->nome}\""))) {
            return resposta('Nome já existe!', 403, false);
        }
        if (!empty(Usuario::select('senha', " WHERE senha = \"{$body->senha}\""))) {
            return resposta('Senha já existe!', 403, false);
        }
        if (!empty(Usuario::select('email', " WHERE email = \"{$body->email}\""))) {
            return resposta('Email já existe!', 403, false);
        }
        $usuario->fill($body);
        $usuario->insertSelf();

        return resposta($usuario);
    }
}