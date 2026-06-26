-- Corrige bancos que já tinham posts.publicado criado antes da separação entre
-- conteúdo privado e conteúdo publicado no feed.
-- Regra: curso copiado/salvo continua privado; conteúdos originais de exemplo
-- ficam publicados para o feed sem filtro conseguir listar posts.
UPDATE posts
LEFT JOIN cursos ON cursos.post_id = posts.id
SET posts.publicado = 1
WHERE posts.publicado = 0
  AND (posts.tipo <> 1 OR cursos.origem_curso_id IS NULL);

UPDATE posts
JOIN cursos ON cursos.post_id = posts.id
SET posts.publicado = 0
WHERE cursos.origem_curso_id IS NOT NULL;

UPDATE cursos
JOIN posts ON posts.id = cursos.post_id
SET cursos.publicado = posts.publicado;
