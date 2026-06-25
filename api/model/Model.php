<?php

#[\AllowDynamicProperties]
abstract class Model implements \JsonSerializable {
    public static $tabela = '';
    protected static $manyToMany = [];
    protected static $oneToMany = [];
    protected static $manyToOne = [];
    protected static $atributos = [];
    protected static $nonFillable = [];
    protected $atributosExtras = [];

    public function __construct(Array $atributosExtras = [])
    {
        $this->atributosExtras = $atributosExtras;
    }

    public function fill($data) {
        if (empty($data)) return;
        foreach ($data as $key => $value) {
            if (!in_array($key, static::$atributos)) continue;
            if (in_array($key, static::$nonFillable)) continue;
            $this->$key = $value;
        }
    }

    public function fillRelations($data) {
        if (empty($data)) return;
        foreach ($data as $relName => $relations) {
            if (!array_key_exists($relName, static::$manyToMany)) continue;
            $this->$relName = [];
            foreach ($relations as $relationID) {
                $this->putRelation($relName, $relationID, []);
            }
        }
    }

    public function insertSelf() {
        $newID = static::insert($this->converterJson(false, false));
        if (in_array('id', static::$atributos)) $this->id = $newID;
    }

    public function jsonSerialize(): mixed {
        return $this->converterJson();
    }

    public function converterJson($includeExtra = true, $includeRelations = true): mixed {
        $json = [];
        foreach (static::$atributos as $atributo) {
            $json[$atributo] = $this->$atributo ?? null;
        }
        if ($includeExtra) {
            foreach ($this->atributosExtras as $atributo) {
                $json[$atributo] = $this->$atributo ?? null;
            }
        }
        if ($includeRelations) {
            foreach (static::$manyToMany as $relName => $relation) {
                $json[$relName] = $this->$relName ?? [];
            }
        }
        return $json;
    }

    public static function fetch() {
        static::$atributos = DB::tabelaColunas(static::$tabela);
        foreach (static::$manyToMany as &$relation) {
            $relation["pivotAttributes"] = array_diff(DB::tabelaColunas($relation[1]), [$relation[2], $relation[3]]);
        }
    }

    #region DB functions

    /**
    * @return array
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
        $atributos = array_filter($atributos, function($value, $key) {
            return !($key === 'id' && $value === null);
        }, ARRAY_FILTER_USE_BOTH);

        $insertString = implode(',',array_keys($atributos));
        $placeholders = implode(',', array_fill(0, count($atributos), '?'));

        $tabela = static::$tabela;
        $sql = "INSERT INTO {$tabela} ({$insertString}) VALUES ({$placeholders}) {$sqlExtra}";
        DB::executar($sql, [...array_values($atributos), ...$params]);
        if (in_array('id', static::$atributos))
            return DB::queryAssoc("SELECT max(id) as id FROM {$tabela}", [])[0]['id'];
        return -1;
    }

    public static function update(Array $atributos, string $sqlExtra = '', Array $params = []) {
        $tabela = static::$tabela;
        if (empty($atributos['id'])) return false;

        $updatedValues = array_filter($atributos, function($value, $key) {
            return $key !== 'id' && $value !== null;
        }, ARRAY_FILTER_USE_BOTH);

        $updatedValuesStr = implode(',', array_map(function ($key) {
            return "{$key} = ?";
        }, array_keys($updatedValues)));

        $sql = "UPDATE {$tabela} SET {$updatedValuesStr} WHERE id = ? {$sqlExtra}";
        return DB::executar($sql, [...array_values($updatedValues), $atributos['id'], ...$params]);
    }

    #endregion

    #region Relations

    public function loadRelation(String $relation) {
        if (array_key_exists($relation, static::$oneToMany)) {
            $curRel = static::$oneToMany[$relation];
            $model = $curRel[0];
            fetchModel($model);
            $this->$relation = $model::select(
                sqlExtra: "WHERE {$curRel[1]} = ?",
                params: [$this->id]
            );
        }
        
        else if (array_key_exists($relation, static::$manyToMany)) {
            $curRel = static::$manyToMany[$relation];
            $model = $curRel[0];
            fetchModel($model);
            $pivotTable = $curRel[1];
            $selfFKey = $curRel[2];
            $otherFKey = $curRel[3];

            $pivotAttributes = array_diff(DB::tabelaColunas($pivotTable), ['id', $selfFKey, $otherFKey]);
            $pivotAttributes = array_map(function($attribute) {
                return $attribute;
            }, $pivotAttributes);

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

    public function putRelation(String $relation, int $relatedID, Array $pivotAttributes) {
        if (empty($this->$relation)) $this->$relation = [];
        $curRel = static::$manyToMany[$relation];
        $model = $curRel[0];
        fetchModel($model);
        $related = $model::select('*', " WHERE id = ?", [$relatedID])[0] ?? null;
        if (!$related) return;
        $this->$relation[] = [
            ...$related->jsonSerialize(),
            ...$pivotAttributes
        ];
    }

    public function saveRelations(String $relation) {
        if (empty($this->id)) {
            die(resposta('Tentativa de salvar relações de model sem id!', 401, false));
        }
        $relationInfo = static::$manyToMany[$relation];
        $relatedArr = $this->$relation ?? [];
        $pivotTable = $relationInfo[1];
        $selfID = $relationInfo[2];
        $otherID = $relationInfo[3];
        foreach ($relatedArr as $related) {
            $related = (array)$related;
            $existing = DB::queryAssoc("SELECT * FROM {$pivotTable} WHERE {$selfID} = ? AND {$otherID} = ?", [$this->id, $related['id']]);
            if (empty($existing)) {
                DB::executar("INSERT INTO {$pivotTable} ({$selfID}, {$otherID}) VALUES (?, ?)", [$this->id, $related['id']]);
            }
        }
    }

    #endregion

}
