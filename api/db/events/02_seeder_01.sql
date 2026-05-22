
INSERT INTO posts (titulo, data_criacao, nivel_publicidade) VALUES
    ('As viagens de Brás Cubas', '2015-02-02', 'publico'),
    ('Meu amigo', '2020-05-05', 'publico'),
    ('Revolução Francesa', '2026-10-10', 'publico');


INSERT INTO categorias (nome, descricao) VALUES
    ('História', ''),
    ('Revolução Francesa', ''),
    ('Gramática', ''),
    ('Literatura', '');

INSERT INTO posts_categorias (post_id, categoria_id) VALUES
    (
        (SELECT id FROM posts WHERE titulo='As viagens de Brás Cubas'),
        (SELECT id FROM categorias WHERE nome='Literatura'),
    );