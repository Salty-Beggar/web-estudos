#!php

<?php

$pdo = new PDO("mysql:host=db;dbname=web_estudos", "root", "1234");
$comando = $argv[1];
$status = null;
$output = null;

switch ($comando) {
    case 'migrate':
        $sql = $pdo->prepare('SELECT max(id) as max_id FROM events');
        $sql->execute();
        $sql->setFetchMode(PDO::FETCH_ASSOC);
        $migration = $sql->fetch()['max_id'] ?? 0;
        $directory = scandir('/srv/events');
        array_splice($directory, 0, 2);
        $directory = array_map(function($item) {
            return [
                'file' => $item, 
                'tags' => explode('_', $item)
            ];
        }, $directory);
        $directory = array_filter($directory, function($item) {
            if (strlen($item['tags'][0]) > 2) return false;
            return true;
        });
        var_dump($directory);
        break;
}

return 1;
