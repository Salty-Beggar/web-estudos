<?php

require_once 'model/Categoria.php';

class CategoriaController {
    public function select($usuario, $pesquisa = '') {
        $pesquisa = trim($pesquisa ?? '');
        $sql = " ORDER BY nome ASC";
        $params = [];

        if ($pesquisa !== '') {
            $sql = " WHERE nome LIKE ? ORDER BY nome ASC";
            $params[] = '%'.$pesquisa.'%';
        }

        $categorias = Categoria::select('*', $sql, $params);
        return resposta($categorias);
    }

    public function add($usuario, $body) {
        $nome = trim($body->nome ?? $body->genero ?? '');
        if ($nome === '') return resposta('O nome da categoria é obrigatório!', 400, false);

        $categoriaExistente = Categoria::select('*', " WHERE LOWER(nome) = LOWER(?)", [$nome])[0] ?? null;
        if ($categoriaExistente) return resposta($categoriaExistente, 200);

        $categoria = new Categoria();
        $categoria->nome = $nome;
        $categoria->insertSelf();
        return resposta($categoria, 201);
    }
}
