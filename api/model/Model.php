<?php

<<<<<<< HEAD
abstract class Model implements JsonSerializable {
    protected $tabela;

    public function save() {

=======
public class Model implements JsonSerializable {
    protected $table;
    public function __construct() {
        
    }

    public function fill($data) {
        foreach ($data as $key => $value) {
            $this->$key = $value;
        }
>>>>>>> 7d4a158 (Parallel changes)
    }
}