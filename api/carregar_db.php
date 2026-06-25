<?php

class DB {
    private static $pdo;

    public static function conectarBanco() {
        try {
            self::$pdo = new PDO("mysql:host=db;dbname=web_estudos;charset=utf8mb4", "root", "1234", [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);        
        }catch(\Throwable $e) {
            throw $e;
        }
    }

    public static function executar(string $sql, Array $params) {
        $comando = self::$pdo->prepare($sql);
        $comando->execute($params);
        return $comando;
    }

    public static function query(string $sql, Array $params, string $model, Array $atributosExtras) {
        $comando = self::$pdo->prepare($sql);
        $comando->setFetchMode(PDO::FETCH_CLASS, $model, ['atributosExtras' => $atributosExtras]);
        $comando->execute($params);
        return $comando->fetchAll();
    }

    public static function queryAssoc(string $sql, Array $params) {
        $comando = self::$pdo->prepare($sql);
        $comando->setFetchMode(PDO::FETCH_ASSOC);
        $comando->execute($params);
        return $comando->fetchAll();
    }

    static function tabelaColunas($tabela) {
        $comando = self::$pdo->prepare('
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.columns
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
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
