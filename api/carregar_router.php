<?php

require_once './controller/AuthController.php';

class Router {

    private Array $rotaMapa = [];

    public function __construct() {
        $this->rotaMapa['GET'] = [];
        $this->rotaMapa['POST'] = [];
        $this->rotaMapa['PUT'] = [];
        $this->rotaMapa['DELETE'] = [];
    }

    private function criarRota(String $method, String $rota, Array $funcao, bool $protected = true) {
        $rotaSegmentos = explode('/', $rota);
        $segmentoAnterior = &$this->rotaMapa[$method];
        foreach ($rotaSegmentos as $segmento) {
            if (empty($segmento)) continue;
            $parametroAtual = preg_match('/^{.*}/', $segmento);
            if (!empty($parametroAtual)) {
                if (!array_key_exists('PARAM', $segmentoAnterior)) {
                    $segmentoAnterior['PARAM'] = [];
                }
                $segmentoAnterior =& $segmentoAnterior['PARAM'];
            }else {
                if (!array_key_exists($segmento, $segmentoAnterior)) {
                    $segmentoAnterior[$segmento] = [];
                }
                $segmentoAnterior =& $segmentoAnterior[$segmento];
            }
        }
        $segmentoAnterior['ROUTE'] = [$funcao, $protected];
    }

    public function lerRota(String $method, String $rota) {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Content-Type: application/json; charset=UTF-8");

        if ($method === 'OPTIONS') {
            http_response_code(204);
            die();
        }

        $rota = parse_url($rota, PHP_URL_PATH) ?? '/';
        $rota = urldecode($rota);

        if (!array_key_exists($method, $this->rotaMapa)) {
            die(resposta('Método não permitido!', 405, false));
        }

        $rotaSegmentos = explode('/', $rota);
        $segmentoAnterior = $this->rotaMapa[$method];
        $parametros = [];
        foreach ($rotaSegmentos as $segmento) {
            if (empty($segmento)) continue;
            if (!in_array($segmento, array_keys($segmentoAnterior))) {
                if (empty($segmentoAnterior['PARAM'])) {
                    die(resposta('Rota não encontrada!', 404, false));
                }
                $parametros[] = $segmento;
                $segmentoAnterior = $segmentoAnterior['PARAM'];
            }else {
                $segmentoAnterior = $segmentoAnterior[$segmento];
            }
        }

        if (!empty($segmentoAnterior['ROUTE'])) {
            $funcao = $segmentoAnterior['ROUTE'][0];
            $protegido = $segmentoAnterior['ROUTE'][1];
            
            if ($protegido) {
                $headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
                $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
                if (empty($authorization)) die(
                    resposta('É necessário fazer login!', 403, false)
                );
                $token = explode(' ', $authorization);
                $token = end($token);
                // echo json_encode($token);
                $tokenInfo = AuthController::lerToken($token);
                if (!$tokenInfo['success']) die(resposta($tokenInfo['message'], 403, false));
                $usuario = $tokenInfo['message'];
            }
            $controllerNome = $funcao[0];
            fetchController($controllerNome);
            $controllerNamespace = $controllerNome;
            $controller = new $controllerNamespace();

            $parametrosAdicionais = [];
            if ($protegido) $parametrosAdicionais[] = $usuario;
            if ($method === 'POST' || $method === 'PUT') {
                $body = json_decode(file_get_contents('php://input'));
                $parametrosAdicionais[] = $body ?? new stdClass();
            }
            $parametros = [...$parametrosAdicionais, ...$parametros];
            try {
                die($controller->{$funcao[1]}(...$parametros));
            }catch (\Throwable $e) {
                die(resposta([
                    'erro' => $e->getMessage(),
                    'arquivo' => $e->getFile(),
                    'linha' => $e->getLine()
                ], 500, false));
            }
        }
        die(resposta('Rota não encontrada!', 404, false));
    }

    public function get(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('GET', $rota, $funcao, $protected);
    }

    public function post(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('POST', $rota, $funcao, $protected);
    }

    public function put(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('PUT', $rota, $funcao, $protected);
    }

    public function delete(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('DELETE', $rota, $funcao, $protected);
    }
}
