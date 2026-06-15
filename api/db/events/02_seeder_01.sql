
INSERT INTO posts (titulo, data_criacao, tipo) VALUES
    ('As viagens de Brás Cubas', '2015-02-02', 1),
    ('Meu amigo', '2020-05-05', 1),
    ('Revolução Francesa', '2026-10-10', 2);


INSERT INTO categorias (nome) VALUES
    ('História'),
    ('Revolução Francesa'),
    ('Gramática'),
    ('Literatura');

-- INSERT INTO posts_categorias (post_id, categoria_id) VALUES
--     (
--         (SELECT id FROM posts WHERE titulo='As viagens de Brás Cubas'),
--         (SELECT id FROM categorias WHERE nome='Literatura'),
--     );
