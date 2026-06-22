<?php

require_once 'model/Categoria.php';

class CategoriaController {
    public function select($usuario, $pesquisa = '') {
        $pesquisa = '%'.$pesquisa.'%';
        $categorias = Categoria::select('*', " WHERE nome LIKE ?", [$pesquisa]);

        return resposta($categorias);
    }

    public function add($usuario, $body) {
        $categoria = new Categoria();
        $categoria->fill($body);
        $categoria->insertSelf();
        return resposta($categoria);
    }
}