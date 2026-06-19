<?php

require_once 'model/Usuario.php';

class AuthController {
    private static $senha = 'senha_muito_secreta_123';
    private function gerarToken(Usuario $usuario) {
        $senha = self::$senha;
        $token = "{$senha} {$usuario->id}";
        return base64_encode($token);
    }

    public static function lerToken(string $token) {
        $token = base64_decode($token);
        [$senha, $usuarioID] = explode(' ', $token);
        if ($senha != AuthController::$senha) return [
            'success' => false,
            'message' => 'Token inválido! Sem gracinhas!'
        ];
        $usuario = Usuario::select('*', " WHERE id = {$usuarioID}")[0];
        $usuario->senha = '';
        return [
            'success' => true,
            'message' => $usuario
        ];
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