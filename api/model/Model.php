<?php

abstract class Model implements \JsonSerializable {
    protected static $nome;
    protected static $tabela;
    protected static $manyToMany;
    protected static $oneToMany;
    protected static $manyToOne;
    protected static $atributos;
    protected static $nonFillable = [];
    protected $atributosExtras;

    public function __construct(Array $atributosExtras = [])
    {
        $this->atributosExtras = $atributosExtras;
    }

    public function fill($data) {
        foreach ($data as $key => $value) {
            if (in_array($key, static::$nonFillable)) continue;
            $this->$key = $value;
        }
    }

    public function insertSelf() {
        static::insert($this->converterJson(false, false));
    }

    public function jsonSerialize(): mixed {
        return $this->converterJson();
    }

    public function converterJson($includeExtra = true, $includeRelations = true): mixed {
        $json = [];
        foreach (static::$atributos as $atributo) {
            $json[$atributo] = $this->$atributo;
        }
        if ($includeExtra) {
            foreach ($this->atributosExtras as $atributo) {
                $json[$atributo] = $this->$atributo;
            }
        }
        if ($includeRelations) {
            foreach (static::$manyToMany as $relName => $relation) {
                $json[$relName] = [];
                $json[$relName] = $this->$relName;
            }
        }
        return $json;
    }

    public static function fetch() {
        if (empty(static::$nome)) static::$nome = substr(static::$tabela, -1);
        static::$atributos = DB::tabelaColunas(static::$tabela);
        foreach (static::$manyToMany as &$relation) {
            $relation["pivotAttributes"] = array_diff(DB::tabelaColunas($relation[1]), [$relation[2], $relation[3]]);
        }
    }

    #region DB functions

    /**
    * @return {Post}
    */
    public static function select(
            string|Array $atributos = '*', 
            String $sqlExtra = '', 
            Array $params = [],
            Array $atributosExtras = []
        ) {
        if (is_array($atributos)) $atributos = implode(', ', $atributos);
        $tabela = static::$tabela;
        $sql = "SELECT {$atributos} FROM {$tabela} {$sqlExtra}";
        return DB::query($sql, $params, static::class, $atributosExtras);
    }

    public static function insert(Array $atributos, string $sqlExtra = '', Array $params = []) {
        $insertString = implode(',',array_keys($atributos));
        $valuesString = implode(',', array_map(function($value) {
            return !empty($value) ?"\"{$value}\"" : 'null';
        }, array_values($atributos)));

        $tabela = static::$tabela;
        $sql = "INSERT INTO {$tabela} ({$insertString}) VALUES ({$valuesString}) {$sqlExtra}";
        $paramsFinal = [...$params];
        return DB::executar($sql, $paramsFinal);
    }

    public static function update(Array $atributos, string $sqlExtra = '', Array $params = []) {
        $tabela = static::$tabela;
        $updatedValues = array_filter($atributos, function($value) {
            return !empty($value);
        });
        $updatedValuesStr = implode(',', array_map(function ($key, $value) {
            return "{$key} = {$value}";
        }, $updatedValues));
        $sql = "UPDATE FROM {$tabela} VALUES {$updatedValuesStr} WHERE id = {$atributos['id']}";
        return DB::executar($sql, []);
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

            $pivotAttributes = array_diff(DB::tabelaColunas($pivotTable), ['id', $selfFKey, $otherFKey]);
            // $pivotAttributes[] = $pivotTable.'.id';
            $pivotAttributes = array_map(function($attribute) use ($pivotTable) {
                return $attribute;
            }, $pivotAttributes);

            // var_dump($model::select());
            $this->$relation = $model::select(
                [$model::$tabela.'.*', ...$pivotAttributes],
                "
                    JOIN {$pivotTable}
                    ON {$pivotTable}.{$otherFKey} 
                        = {$model::$tabela}.id
                    WHERE {$pivotTable}.{$selfFKey} = ?
                ",
                [$this->id],
                $pivotAttributes
            );  
        }
        
    }

    public function putRelation(String $relation, int $relatedID, Array $pivotAttributes) { // Somente para many to many
        
    }

    public function saveRelations(String $relation) { // Somente para many to many
        
    }

    #endregion

}