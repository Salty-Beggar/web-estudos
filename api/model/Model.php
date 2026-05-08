<?php



abstract class Model implements \JsonSerializable {
    protected static $nome;
    protected static $tabela;
    protected static $relManyToMany;
    protected static $relOneToMany;
    protected static $relManyToOne;
    protected static $atributos;

    public function fill($data) {
        foreach ($data as $key => $value) {
            $this->$key = $value;
        }
    }

    public function jsonSerialize(): mixed {
        $json = [];
        foreach (static::$atributos as $atributo) {
            $json[$atributo] = $this->$atributo;
        }
        return $json;
    }

    public static function fetch() {
        if (empty(static::$nome)) static::$nome = substr(static::$tabela, -1);
        echo 'Modelell:';
        echo static::class;
        static::$atributos = DB::tabelaColunas(static::$tabela);
    }

    #region DB functions

    static public function select(string|Array $atributos = '*', String $sqlExtra = '', Array $params = []) {
        if (is_array($atributos)) $atributos = implode(', ', $atributos);
        $sql = "SELECT ? FROM ? {$sqlExtra}";
        $paramsFinal = [$atributos, static::$tabela, ...$params];
        return DB::query($sql, $paramsFinal, static::class);
    }

    static public function insert(Array $atributos, string $sqlExtra, Array $params) {
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

    #region Relations

    public function loadRelation(String $relation) {
        if (array_key_exists($relation, static::$oneToMany)) {
            $curRel = static::$oneToMany[$relation];
            $model = $curRel[0];
            fetchModel($model);
            $this->$relation = $model
            ::class
            ::select(
                sqlExtra: 'WHERE ? = ?',
                params: [$curRel[1], $this->id]
            );
        }

        else if (array_key_exists($relation, static::$manyToMany)) {
            $curRel = static::$manyToMany[$relation];
            $model = $curRel[0];
            $pivotTable = $curRel[1];
            $selfFKey = $curRel[2];
            $otherFKey = $curRel[3];

            // var_dump($curRel);

            // die;

            fetchModel($model);

            $this->$relation = $model::select(
                $model::$tabela.'.*',
                'LEFT JOIN ? ON ?.id = ?.? WHERE ? = ?',
                [
                    $pivotTable,
                    $model::$tabela, $pivotTable, $otherFKey,
                    $selfFKey, $this->id
                ]
            );  
        }
        
    }

    #endregion

}