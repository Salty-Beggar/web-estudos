<?php

require_once 'model/Usuario.php';

class AuthController {
    private static $senha = 'senha_muito_secreta_123';
    private function gerarToken(Usuario $usuario) {
        $senha = self::$senha;
        $token = "{$senha} {$usuario->id}";
        return base64_encode($token);
    }

    public function fazerLogin($body) {
        $senha = base64_encode($body->senha);
        $usuario = Usuario::select(['id', 'senha'], " WHERE nome = \"{$body->nome}\"");
        if (empty($usuario)) return resposta('Usuário não existe!', 403, false);
        $usuario = $usuario[0];

        if ($usuario->senha === $senha) {
            return resposta($this->gerarToken($usuario));
        }

        return resposta('Senha errada!', 403, false);
    }
}