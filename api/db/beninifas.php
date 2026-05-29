<?php

$pdo = new PDO("mysql:host=db;dbname=web_estudos", "root", "1234");
$comando = $argv[0];

switch ($comando[0]) {
    case 'migrate':

}
