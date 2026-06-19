<?php



use WebEstudos\Controller\FeedController;

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
                if (!empty($segmentoAnterior['PARAM'])) {
                    $segmentoAnterior['PARAM'] = [];
                }
                $segmentoAnterior =& $segmentoAnterior['PARAM'];
            }else {
                if (!empty($segmentoAnterior[$segmento]) && sizeof($segmentoAnterior[$segmento]) == 0) {
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

        $rotaSegmentos = explode('/', $rota);
        $segmentoAnterior = $this->rotaMapa[$method];
        $parametros = [];
        foreach ($rotaSegmentos as $segmento) {
            if (empty($segmento)) continue;
            if (!in_array($segmento, array_keys($segmentoAnterior))) {
                if (empty($segmentoAnterior['PARAM'])) {
                    die(resposta('Rota não encontrada!', 404));
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
                $headers = apache_request_headers();
                
                // $authorization = get_headers();
            }
            $controllerNome = $funcao[0];
            // echo "./controller/{$controllerNome}.php";
            fetchController($controllerNome);
            $controllerNamespace = $controllerNome;
            $controller = new $controllerNamespace();

            // var_dump($controller);
            // echo '<br>';
            // die;
            if ($method === 'POST') $parametros = [json_decode(file_get_contents('php://input')), ...$parametros];
            die($controller->{$funcao[1]}(...$parametros));
        }
        die(resposta('Rota não encontrada!', 404));
    }

    public function get(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('GET', $rota, $funcao);
    }

    public function post(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('POST', $rota, $funcao);
    }

    public function put(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('PUT', $rota, $funcao);
    }

    public function delete(String $rota, Array $funcao, bool $protected = true) {
        $this->criarRota('DELETE', $rota, $funcao);
    }
}
