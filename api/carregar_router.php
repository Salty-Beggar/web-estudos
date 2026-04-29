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

    private function criarRota(String $method, String $rota, Array $funcao) {
        $rotaSegmentos = explode($rota, '/');
        $segmentoAnterior = &$this->rotaMapa[$method];
        foreach ($rotaSegmentos as $segmento) {
            if (empty($segmento)) continue;
            $parametroAtual = preg_match('/^{.*}/', $segmento);
            echo $segmento;
            if (!empty($parametroAtual)) {
                if (!empty($segmentoAnterior['PARAM'])) {
                    $segmentoAnterior['PARAM'] = [];
                }
                $segmentoAnterior = &$segmentoAnterior['PARAM'];
            }else {
                if (!empty($segmentoAnterior[$segmento])) {
                    $segmentoAnterior[$segmento] = [];
                }
                $segmentoAnterior = &$segmentoAnterior[$segmento];
            }
        }
        $segmentoAnterior['ROUTE'] = $funcao;
    }

    public function lerRota(String $method, String $rota) {
        $rotaSegmentos = explode($rota, '/');
        $segmentoAnterior = $this->rotaMapa[$method];
        $parametros = [];
        foreach ($rotaSegmentos as $segmento) {
            if (empty($segmento)) continue;
            $parametroAtual = preg_match('/^{.*}/', $segmento);
            if (!empty($parametroAtual)) {
                if (empty($segmentoAnterior['PARAM'])) {
                    http_response_code(404);
                    return false;
                }
                $parametros[] = $parametroAtual;
                $segmentoAnterior = $segmentoAnterior['PARAM'];
            }else {
                $segmentoAnterior = $segmentoAnterior[$segmento];
            }
        }
        // var_dump($this->rotaMapa);
        if (!empty($segmentoAnterior['ROUTE'])) {
            $funcao = $segmentoAnterior['ROUTE'];
            $controllerNome = $funcao[0];
            // echo "./controller/{$controllerNome}.php";
            fetchController($controllerNome);
            $controllerNamespace = $controllerNome;
            $controller = new $controllerNamespace();
            $controller->{$funcao[1]}(...$parametros);
            return true;
        }
        http_response_code('404');
        return false;
    }

    public function get(String $rota, Array $funcao) {
        $this->criarRota('GET', $rota, $funcao);
    }

    public function post(String $rota, Array $funcao) {
        $this->criarRota('POST', $rota, $funcao);
    }

    public function put(String $rota, Array $funcao) {
        $this->criarRota('PUT', $rota, $funcao);
    }

    public function delete(String $rota, Array $funcao) {
        $this->criarRota('DELETE', $rota, $funcao);
    }
}
