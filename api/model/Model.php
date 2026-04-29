<?php



abstract class Model implements \JsonSerializable {
    protected static $nome;
    protected static $tabela;
    protected static $relacoes;
    protected static $atributos;

    public function fill($data) {
        foreach ($data as $key => $value) {
            $this->$key = $value;
        }
    }

    public function jsonSerialize() {

    }

    public static function fetch() {
        if (empty(static::$nome)) static::$nome = substr(static::$tabela, -1);
        static::$atributos = DB::tabelaColunas(static::$tabela);
    }

    #region DB functions

    static public function select(String|Array $atributos = '*', String $sqlExtra = '', Array $params = []) {
        if (is_array($atributos)) $atributos = implode(', ', $atributos);
        $sql = "SELECT ? FROM ? {$sqlExtra}";
        $paramsFinal = [$atributos, static::$tabela, ...$params];
        return DB::query($sql, $paramsFinal, static::class);
    }

    static public function insert(Array $atributos, String $sqlExtra, Array $params) {
        $insertString = '';
        $valuesString = '';
        foreach ($atributos as $chave => $valor) {
            $insertString .= $chave.',';
            $valuesString .= $valor.',';
        }
        $sql = "INSERT INTO ? (?) VALUES (?) {$sqlExtra}";
        $paramsFinal = [static::$tabela, $insertString, $valuesString, ...$params];
        return DB::executar($sql, $paramsFinal);
    }

    #endregion
}