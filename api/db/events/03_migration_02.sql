ALTER TABLE feeds
    ADD COLUMN IF NOT EXISTS ultimo_feed_ativo boolean not null default false;

-- Publicação agora pertence ao post base, não somente ao subtipo curso.
-- Em bancos antigos, posts já existentes entram como publicados para não sumirem do feed.
ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS publicado boolean not null default true;

UPDATE posts
SET publicado = 1
WHERE publicado IS NULL;

UPDATE posts
JOIN cursos ON cursos.post_id = posts.id
SET posts.publicado = cursos.publicado
WHERE posts.tipo = 1;

ALTER TABLE posts
    MODIFY COLUMN publicado boolean not null default false;

ALTER TABLE cursos
    MODIFY COLUMN publicado boolean not null default false;
