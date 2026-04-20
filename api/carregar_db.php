<?php

class DB {
    private static $pdo;

    public static function conectarBanco() {
        self::$pdo = new PDO("mariadb:host=localhost;dbname=web_estudos", "root", "");
    }

    public static function raw(string $sql, Array $params, ?string $model) {
        $comando = self::$pdo->prepare($sql, $params);
        if (!empty($model)) $comando->setFetchMode(PDO::FETCH_CLASS, $model);
        $comando->execute();
        if (!empty($model)) return $comando->fetchAll();
        return true;
    }
}

DB::conectarBanco();
