<?php

$configStr = file_get_contents('./beninifas.json');
$config = json_decode($configStr);

$comando = $argv[1];
$status = null;
$output = null;

switch ($comando) {
    case 'migrate':
        $comandoComOpcoes = implode(' ', array_slice($argv, 1));
        exec("docker exec -it {$config->containers->db} php /srv/beninifas.php {$comandoComOpcoes}", $output, $status);
        $output = implode("\n", $output);
        break;
    default:
        $output = "Comando {$comando} não encontrado!";
        break;
}

print_r($output);