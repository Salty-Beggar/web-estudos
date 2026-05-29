<?php

$configStr = file_get_contents('./beninifas.json');
$config = json_decode($configStr);

$comando = $argv[0];
$status = null;
$output = null;

switch ($comando) {
    case 'migrate':
        exec("docker exec -it {$config['containers']['db']} /srv/events/beninifaz.py migrate");
}