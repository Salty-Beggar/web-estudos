<?php

class DB {
    private static $pdo;

    public static function conectarBanco() {
        try {
            // phpinfo();
            self::$pdo = new PDO("mysql:host=db;dbname=web_estudos", "root", "1234");        
        }catch(\Throwable $e) {
            echo $e;
        }
    }

    public static function executar(string $sql, Array $params) {
        $comando = self::$pdo->prepare($sql, $params);
        $comando->execute();
        return $comando;
    }

    public static function query(string $sql, Array $params, string $model, Array $atributosExtras) {
        $comando = self::$pdo->prepare($sql);
        $comando->setFetchMode(PDO::FETCH_CLASS, $model, ['atributosExtras' => $atributosExtras]);
        $comando->execute($params);
        
        return $comando->fetchAll();
    }

    static function tabelaColunas($tabela) {
        $comando = self::$pdo->prepare('
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.columns
            WHERE TABLE_NAME = ?
        ');
        $comando->setFetchMode(PDO::FETCH_ASSOC);
        $comando->execute([$tabela]);
        $colunas = $comando->fetchAll();

        foreach ($colunas as &$coluna) {
            $coluna = $coluna['COLUMN_NAME'];
        }

        return $colunas;
    }
}

DB::conectarBanco();
