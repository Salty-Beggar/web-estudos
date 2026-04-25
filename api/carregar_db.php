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

    public static function query(string $sql, Array $params, string $model) {
        $comando = self::$pdo->prepare($sql, $params);
        $comando->setFetchMode(PDO::FETCH_CLASS, $model);
        $comando->execute();
        return $comando->fetchAll();
    }

    static function tabelaColunas($tabela) {

    }
}

DB::conectarBanco();
