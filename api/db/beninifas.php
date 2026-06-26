#!php
<?php

$pdo = new PDO("mysql:host=db;dbname=web_estudos", "root", "1234");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$comando = $argv[1] ?? null;
$opcoes = array_slice($argv, 2);

function rodarArquivoSql(PDO $pdo, string $arquivo): void
{
    $sql = trim(file_get_contents($arquivo));

    if ($sql === '') {
        return;
    }

    $command = $pdo->prepare($sql);
    $command->execute();
    $command->closeCursor();
}

function dadosMigration(string $arquivo): array
{
    $nomeSemExtensao = explode('.', $arquivo)[0];
    $tags = explode('_', $nomeSemExtensao);
    $ordem = $tags[0];

    return [
        'file' => $arquivo,
        'tags' => $tags,
        'ordem' => $ordem,
        'numero' => is_numeric($ordem) ? (int) $ordem : null,
        'refresh' => $ordem === 'refresh',
        'undo' => strlen($ordem) > 2 && $ordem[2] === 'u'
    ];
}

function compararMigrations(array $a, array $b): int
{
    if ($a['refresh']) return -1;
    if ($b['refresh']) return 1;

    if ($a['numero'] !== null && $b['numero'] !== null) {
        return $a['numero'] <=> $b['numero'];
    }

    return $a['ordem'] <=> $b['ordem'];
}

switch ($comando) {
    case 'migrate':
        $fresh = in_array('--fresh', $opcoes);

        $arquivos = array_values(array_filter(scandir('/srv/events'), function ($arquivo) {
            return str_ends_with($arquivo, '.sql');
        }));

        $migrations = array_map('dadosMigration', $arquivos);
        usort($migrations, 'compararMigrations');

        $migrationsNormais = array_values(array_filter($migrations, function ($migration) {
            return !$migration['refresh'] && !$migration['undo'];
        }));

        $totalMigrations = count($migrationsNormais);
        $lastMigration = 0;

        if (!$fresh) {
            $sql = $pdo->query('SELECT max(id) as max_id FROM events;');
            $lastMigration = (int) (($sql->fetch(PDO::FETCH_ASSOC)['max_id'] ?? 0));
            $sql->closeCursor();
        }

        if ($fresh) {
            $migrationsParaRodar = array_values(array_filter($migrations, function ($migration) {
                return $migration['refresh'] || (!$migration['undo'] && !$migration['refresh']);
            }));
        } else {
            $migrationsParaRodar = array_values(array_filter($migrationsNormais, function ($migration) use ($lastMigration) {
                return $migration['numero'] !== null && $migration['numero'] > $lastMigration;
            }));
        }

        foreach ($migrationsParaRodar as $migration) {
            $arquivo = "/srv/events/{$migration['file']}";

            try {
                rodarArquivoSql($pdo, $arquivo);
            } catch (Exception $e) {
                echo "Houve a seguinte falha em rodar a migration {$migration['file']}\n{$e->getMessage()}";
                return 1;
            }
        }

        $pdo->exec('DELETE FROM events;');
        $updateMigration = $pdo->prepare('INSERT INTO events (id) VALUES (:id);');
        $updateMigration->execute(['id' => $totalMigrations]);
        $updateMigration->closeCursor();

        if ($fresh) {
            echo "Migrations rodadas com sucesso!\nAs migrações foram revertidas conforme o arquivo refresh.sql,\ne as {$totalMigrations} migrations foram rodadas novamente!";
            break;
        }

        if (count($migrationsParaRodar) === 0) {
            echo "Todas migrations já foram rodadas!";
            break;
        }

        echo "Migrations rodadas com sucesso!\nDas {$lastMigration} migrations anteriores, foram rodadas todas até {$totalMigrations}";
        break;

    default:
        echo "Comando não encontrado!";
        break;
}

return 1;
