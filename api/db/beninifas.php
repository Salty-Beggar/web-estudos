#!php

<?php

$pdo = new PDO("mysql:host=db;dbname=web_estudos", "root", "1234");
$comando = $argv[1];
$opcoes = array_slice($argv, 2);
$status = null;
$output = null;

switch ($comando) {
    case 'migrate':
        $options = [
            'fresh' => in_array('--fresh', $opcoes)
        ];

        $lastMigration = 0;
        if (!$options['fresh']) {
            $sql = $pdo->prepare('SELECT max(id) as max_id FROM events;');
            $sql->execute();
            $sql->setFetchMode(PDO::FETCH_ASSOC);
            $lastMigration = $sql->fetch()['max_id'] ?? 0;
            $sql->closeCursor();
        }
        $directory = scandir('/srv/events');
        array_splice($directory, 0, 2);
        $directory = array_map(function($item) {
            return [
                'file' => $item, 
                'tags' => explode('_', explode('.', $item)[0])
            ];
        }, $directory);
        $directory = array_filter($directory, function($item) use ($options) {
            if (
                (
                    strlen($item['tags'][0]) > 2 &&
                    $item['tags'][0][2] == 'u'
                )
                || (!$options['fresh'] && $item['tags'] == 'refresh')
                ) return false;
            return true;
        });
        array_splice($directory, 0, $lastMigration);
        usort($directory, function($a, $b) {
            $a = $a['tags'][0];
            $b = $b['tags'][0];
            if ($a == 'refresh') return -1;
            else if ($b == 'refresh') return 1;
            else ($a < $b) 
            ? -1 
            : (
                ($a == $b) 
                ? 0 
                : 1
            );
        });
        var_dump($directory);
        foreach ($directory as $migrationFile) {
            $migrationSQL = file_get_contents("/srv/events/{$migrationFile['file']}");
            if (empty($migrationSQL)) continue;
            $command = $pdo->prepare($migrationSQL);
            $command->execute();
        }
        $migrationAmount = sizeof($directory) - $options['fresh'];
        $updateMigration = $pdo->prepare("INSERT INTO events (id) VALUES ({$migrationAmount});");
        $updateMigration->execute();
        $updateMigration->closeCursor();
        if ($options['fresh']) {
            echo "Migrations rodadas com sucesso!
            \nAs migrações foram revertidas conforme o arquivo refresh.sql,
            \ne as {$migrationAmount} migrations foram rodadas novamente!";
            break;
        }
        echo "Migrations rodadas com sucesso!
        \nDas {$lastMigration} migrations anteriores, foram rodadas todas até {$migrationAmount}";
        break;
}

return 1;
