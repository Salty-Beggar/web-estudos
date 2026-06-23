<?php

require_once 'model/Post.php';
require_once 'model/Feed.php';

class FeedController {
    public function carregarFeed($usuario, $feedID, $pesquisa = "") {
        // if (empty($config)) return resposta('Não há as configurações do feed!', 403, false);
        // // $config = json_decode($config);
        // return resposta($config);
        
        // $pesquisa = $config['pesquisa'];
        // $feedID = $config['feed_id'];
        $feed = Feed::select('*', " WHERE id = {$feedID}");
        if (empty($feed)) return resposta('Feed inválido!', 403, false);
        $feed = $feed[0];
        $feed->loadRelation('categorias');
        $categorias = $feed->categorias;
        
        
        $pesquisa = '%'.$pesquisa.'%';
        $posts = Post::select('*', " WHERE titulo LIKE ?", [$pesquisa]);
        foreach ($posts as &$post) {
            $post->loadRelation('categorias');
        }

        $feedCategorias = array_map(function($categoria) {
            return $categoria->id;
        }, $categorias);
        
        usort($posts, function($a, $b)use ($feedCategorias) {
            $aProduct = 1;
            foreach ($a->categorias as $categoria) {
                if (!in_array($categoria->id, $feedCategorias)) continue;
                $aProduct *= $categoria->votos;
            }
            $bProduct = 1;
            foreach ($b->categorias as $categoria) {
                if (!in_array($categoria->id, $feedCategorias)) continue;
                $bProduct *= $categoria->votos;
            }
            return $aProduct < $bProduct;
        });

        foreach ($posts as &$post) {
            $post['usuario'] = Usuario::select('*', " WHERE id = {$post->usuario_id}")[0];
            $post['usuario']->senha = null;
            foreach ($post->categorias as &$categoria) {
                $voto = DB::queryAssoc("SELECT voto FROM usuarios_posts_categorias WHERE usuario_id = {$usuario->id} AND post_id = ? AND categoria_id = ?", [
                    $post->id, $categoria->id
                ]);
                if (empty($voto)) $voto = 0;
                else {
                    $voto = $voto[0]['voto'];
                }
                $categoria = $categoria->jsonSerialize();
                $categoria['voto_usuario'] = $voto;
            }
        }

        return resposta($posts);
    }

    public function select($usuario) {
        $feeds = Feed::select('*', " WHERE usuario_id = ?", [$usuario->id]);
        foreach ($feeds as &$feed) {
            $feed->loadRelation('categorias');
        }
        return resposta($feeds);
    }

    public function add($usuario, $body) {
        $feed = new Feed();
        $feed->fill($body);
        $feed->usuario_id = $usuario->id;
        $feed->fillRelations($body);
        $feed->insertSelf();
        $feed->saveRelations('categorias');
        return resposta($feed);
    }

    public function addCategoria($usuario, $body, $id, $categoriaID) {
        $feed = Feed::select('*', " WHERE id = {$id}")[0];
        $feed->loadRelation('categorias');
        $feed->putRelation('categorias', $categoriaID, []);
        $feed->saveRelations('categorias');
        return resposta($feed);
    }
}