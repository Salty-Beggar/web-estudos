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
        $token = base64_decode($token, true);
        if (!$token || !str_contains($token, ' ')) return [
            'success' => false,
            'message' => 'Token inválido!'
        ];

        [$senha, $usuarioID] = explode(' ', $token, 2);
        if ($senha != AuthController::$senha) return [
            'success' => false,
            'message' => 'Token inválido! Sem gracinhas!'
        ];

        $usuario = Usuario::select('*', " WHERE id = ?", [$usuarioID])[0] ?? null;
        if (!$usuario) return [
            'success' => false,
            'message' => 'Usuário do token não existe!'
        ];

        $usuario->senha = null;
        return [
            'success' => true,
            'message' => $usuario
        ];
    }

    public function me($usuario) {
        return resposta($usuario);
    }

    public function fazerLogin($body) {
        if (empty($body->email) || empty($body->senha)) {
            return resposta('Email e senha são obrigatórios!', 400, false);
        }

        $senha = base64_encode($body->senha);
        $email = $body->email;   
        $usuarios = Usuario::select(['id', 'senha'], " WHERE email = ?", [$email]);
        if (empty($usuarios)) return resposta('Usuário não existe!', 403, false);

        $usuarioLogin = $usuarios[0];
        if ($usuarioLogin->senha !== $senha) {
            return resposta('Senha errada!', 403, false);
        }

        $usuario = Usuario::select('*', " WHERE id = ?", [$usuarioLogin->id])[0];
        $usuario->senha = null;
        $token = $this->gerarToken($usuarioLogin);

        return resposta([
            'token' => $token,
            'usuario' => $usuario
        ]);
    }
}
