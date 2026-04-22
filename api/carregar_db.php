<?php

<<<<<<< HEAD
class DB {
    private static $pdo;

    public static function conectarBanco() {
        self::$pdo = new PDO("mariadb:host=localhost;dbname=web_estudos", "root", "");
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
}

DB::conectarBanco();
=======
public static class DB {
    public static $pdo;
    static function connect() {
        self::$pdo = new PDO('host=localhost;db=', '');
    }
    static function tabelaColunas($tabela) {

    }
}
>>>>>>> 7d4a158 (Parallel changes)
