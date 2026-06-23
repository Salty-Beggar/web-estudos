-- ============================================================
-- SEEDER for the given MariaDB schema
-- (run this after your migration)
-- ============================================================

-- ------------------------------------------------------------
-- 1. USUÁRIOS (20 rows)
-- ------------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha) VALUES
(1, 'Ana Silva', 'ana.silva@email.com', 'hash_ana123'),
(2, 'Bruno Costa', 'bruno.costa@email.com', 'hash_bruno456'),
(3, 'Carla Mendes', 'carla.m@email.com', 'hash_carla789'),
(4, 'Diego Souza', 'diego.s@email.com', 'hash_diego101'),
(5, 'Elena Ferreira', 'elena.f@email.com', 'hash_elena112'),
(6, 'Felipe Rocha', 'felipe.r@email.com', 'hash_felipe131'),
(7, 'Gabriela Lima', 'gabi.l@email.com', 'hash_gabi415'),
(8, 'Henrique Alves', 'henrique.a@email.com', 'hash_henrique161'),
(9, 'Isabela Pereira', 'isabela.p@email.com', 'hash_isabela718'),
(10, 'João Oliveira', 'joao.o@email.com', 'hash_joao191'),
(11, 'Karina Santos', 'karina.s@email.com', 'hash_karina202'),
(12, 'Leonardo Martins', 'leo.m@email.com', 'hash_leo212'),
(13, 'Mariana Castro', 'mariana.c@email.com', 'hash_mariana223'),
(14, 'Nicolas Ferreira', 'nicolas.f@email.com', 'hash_nicolas234'),
(15, 'Olívia Gomes', 'olivia.g@email.com', 'hash_olivia245'),
(16, 'Paulo Henrique', 'paulo.h@email.com', 'hash_paulo256'),
(17, 'Quintina Melo', 'quintina.m@email.com', 'hash_quintina267'),
(18, 'Rafaela Nunes', 'rafaela.n@email.com', 'hash_rafaela278'),
(19, 'Samuel Dias', 'samuel.d@email.com', 'hash_samuel289'),
(20, 'Tatiane Rocha', 'tatiane.r@email.com', 'hash_tatiane290');

-- ------------------------------------------------------------
-- 2. CATEGORIAS (6 rows)
-- ------------------------------------------------------------
INSERT INTO categorias (id, nome) VALUES
(1, 'Tecnologia'),
(2, 'Saúde'),
(3, 'Educação'),
(4, 'Finanças'),
(5, 'Esportes'),
(6, 'Entretenimento');

-- ------------------------------------------------------------
-- 3. POSTS (20 rows)
-- tipo: 1=Curso, 2=Artigo, 3=Questionário, 4=Atividade
-- ------------------------------------------------------------
INSERT INTO posts (id, usuario_id, titulo, data_criacao, tipo) VALUES
(1, 1, 'Curso de Python Básico', '2025-01-10', 1),
(2, 2, 'Curso de SQL Avançado', '2025-02-14', 1),
(3, 3, 'Curso de Fotografia', '2025-03-20', 1),
(4, 4, 'Como manter a calma em crise', '2025-01-22', 2),
(5, 5, '5 hábitos para uma vida saudável', '2025-02-28', 2),
(6, 6, 'Entendendo a economia circular', '2025-03-05', 2),
(7, 7, 'Investimentos para iniciantes', '2025-04-01', 2),
(8, 8, 'O futuro do trabalho remoto', '2025-04-15', 2),
(9, 9, 'Questionário de Lógica', '2025-01-18', 3),
(10, 10, 'Quiz sobre HTML/CSS', '2025-02-20', 3),
(11, 11, 'Teste de conhecimentos gerais', '2025-03-25', 3),
(12, 12, 'Avaliação de matemática', '2025-04-10', 3),
(13, 13, 'Pesquisa de satisfação', '2025-05-02', 3),
(14, 14, 'Atividade: Montar um PC', '2025-01-12', 4),
(15, 15, 'Atividade: Criar uma API REST', '2025-02-18', 4),
(16, 16, 'Atividade: Redação dissertativa', '2025-03-22', 4),
(17, 17, 'Atividade: Cálculo de IMC', '2025-04-05', 4),
(18, 18, 'Atividade: Planejamento financeiro', '2025-04-28', 4),
(19, 19, 'Atividade: Análise de dados', '2025-05-15', 4),
(20, 20, 'Atividade: Criação de um blog', '2025-06-01', 4);

-- ------------------------------------------------------------
-- 4. CURSOS (subtype for post tipo=1)
-- ------------------------------------------------------------
INSERT INTO cursos (post_id) VALUES
(1), (2), (3);

-- ------------------------------------------------------------
-- 5. ARTIGOS (subtype for post tipo=2)
-- ------------------------------------------------------------
INSERT INTO artigos (post_id, corpo) VALUES
(4, 'Em momentos de crise, a respiração profunda e o foco no presente são essenciais.'),
(5, 'Pratique exercícios físicos, alimente-se bem e mantenha uma rotina de sono.'),
(6, 'A economia circular propõe a reutilização de materiais e a redução de desperdícios.'),
(7, 'Comece com aportes mensais e estude sobre renda fixa antes de arriscar.'),
(8, 'O home office veio para ficar, e as empresas estão se adaptando a essa nova realidade.');

-- ------------------------------------------------------------
-- 6. QUESTIONARIOS (subtype for post tipo=3)
-- ------------------------------------------------------------
INSERT INTO questionarios (post_id) VALUES
(9), (10), (11), (12), (13);

-- ------------------------------------------------------------
-- 7. ATIVIDADES (subtype for post tipo=4)
-- ------------------------------------------------------------
INSERT INTO atividades (post_id, enunciado, resposta_certa) VALUES
(14, 'Monte um computador com as seguintes peças: processador, placa-mãe, memória RAM e HD.', 1),
(15, 'Crie uma API que retorne uma lista de usuários em JSON.', 2),
(16, 'Escreva uma redação sobre o impacto das redes sociais na sociedade.', 3),
(17, 'Calcule o IMC de uma pessoa com 70kg e 1.75m.', 4),
(18, 'Elabore um orçamento mensal com renda de R$ 3000 e despesas fixas.', 5),
(19, 'Utilize Python para ler um arquivo CSV e mostrar as 5 primeiras linhas.', 6),
(20, 'Crie um blog simples com HTML, CSS e JavaScript.', 7);

-- ------------------------------------------------------------
-- 8. OPCOES (4 opções para cada atividade)
-- ------------------------------------------------------------
INSERT INTO opcoes (ordem, atividade_id, texto) VALUES
-- Atividade 14
(1, 14, 'Opção A - Placa-mãe, processador, SSD, fonte'),
(2, 14, 'Opção B - Processador, placa-mãe, RAM, HD'),
(3, 14, 'Opção C - HD, monitor, teclado, mouse'),
(4, 14, 'Opção D - Fonte, gabinete, placa de vídeo, RAM'),
-- Atividade 15
(1, 15, 'GET /usuarios retorna todos os usuários'),
(2, 15, 'POST /usuarios cria um novo usuário'),
(3, 15, 'PUT /usuarios/{id} atualiza um usuário'),
(4, 15, 'DELETE /usuarios/{id} remove um usuário'),
-- Atividade 16
(1, 16, 'Tese 1: Redes sociais aumentam a polarização.'),
(2, 16, 'Tese 2: Redes sociais melhoram a comunicação.'),
(3, 16, 'Tese 3: Redes sociais causam ansiedade.'),
(4, 16, 'Tese 4: Redes sociais são ferramentas neutras.'),
-- Atividade 17
(1, 17, 'IMC = 22,86 (Normal)'),
(2, 17, 'IMC = 25,00 (Sobrepeso)'),
(3, 17, 'IMC = 18,50 (Abaixo do peso)'),
(4, 17, 'IMC = 30,00 (Obesidade)'),
-- Atividade 18
(1, 18, 'Sobram R$ 500 para lazer.'),
(2, 18, 'Sobram R$ 200 para lazer.'),
(3, 18, 'Faltam R$ 200 para cobrir as despesas.'),
(4, 18, 'Sobram R$ 800 para lazer.'),
-- Atividade 19
(1, 19, 'usar pandas.read_csv()'),
(2, 19, 'usar csv.reader()'),
(3, 19, 'usar open() e split()'),
(4, 19, 'usar numpy.loadtxt()'),
-- Atividade 20
(1, 20, 'Usar HTML semântico e CSS flexbox.'),
(2, 20, 'Usar apenas tags <div>.'),
(3, 20, 'Incluir JavaScript para interatividade.'),
(4, 20, 'Publicar em um serviço de hospedagem.');

-- ------------------------------------------------------------
-- 9. FEEDS (10 rows)
-- ------------------------------------------------------------
INSERT INTO feeds (id, usuario_id, titulo, descricao) VALUES
(1, 1, 'Feed de Tecnologia', 'Últimas novidades do mundo tech'),
(2, 2, 'Saúde em Dia', 'Dicas e artigos sobre bem-estar'),
(3, 3, 'Educação Inovadora', 'Métodos e reflexões sobre ensino'),
(4, 4, 'Mercado Financeiro', 'Análises e previsões econômicas'),
(5, 5, 'Esporte Total', 'Cobertura de campeonatos e treinos'),
(6, 6, 'Cultura e Lazer', 'Filmes, séries e entretenimento'),
(7, 7, 'Ciência Hoje', 'Descobertas e pesquisas científicas'),
(8, 8, 'Política em Foco', 'Análise de cenários políticos'),
(9, 9, 'Meio Ambiente', 'Sustentabilidade e ecologia'),
(10, 10, 'Startups & Negócios', 'Empreendedorismo e inovação');

-- ------------------------------------------------------------
-- 10. USUARIOS_POSTS (many-to-many) – 25 rows
-- ------------------------------------------------------------
INSERT INTO usuarios_posts (usuario_id, post_id) VALUES
(1, 2), (1, 5), (1, 9),
(2, 3), (2, 6), (2, 10), (2, 15),
(3, 1), (3, 7), (3, 11),
(4, 4), (4, 8), (4, 12), (4, 16),
(5, 5), (5, 13), (5, 17),
(6, 6), (6, 14), (6, 18),
(7, 1), (7, 19),
(8, 2), (8, 20),
(9, 3);

-- ------------------------------------------------------------
-- 11. FEEDS_CATEGORIAS (15 rows)
-- ------------------------------------------------------------
INSERT INTO feeds_categorias (feed_id, categoria_id) VALUES
(1, 1), (1, 3),
(2, 2),
(3, 3), (3, 6),
(4, 4),
(5, 5),
(6, 6),
(7, 1), (7, 2),
(8, 4),
(9, 1), (9, 2),
(10, 3), (10, 4);

-- ------------------------------------------------------------
-- 12. POSTS_CATEGORIAS (30 rows – each post has 1 or 2 categories)
-- ------------------------------------------------------------
INSERT INTO posts_categorias (post_id, categoria_id, votos) VALUES
(1, 1, 15), (1, 3, 10),
(2, 1, 22), (2, 4, 5),
(3, 6, 18),
(4, 2, 30),
(5, 2, 12), (5, 5, 8),
(6, 1, 25), (6, 3, 14),
(7, 4, 40),
(8, 1, 20), (8, 6, 6),
(9, 1, 10), (9, 3, 15),
(10, 1, 5), (10, 6, 4),
(11, 3, 18),
(12, 3, 9), (12, 4, 7),
(13, 6, 12),
(14, 1, 28), (14, 3, 11),
(15, 1, 35),
(16, 3, 8), (16, 6, 5),
(17, 2, 19),
(18, 4, 22), (18, 1, 13),
(19, 1, 30),
(20, 6, 15);

-- ------------------------------------------------------------
-- 13. USUARIOS_POSTS_CATEGORIAS (20 rows)
-- Must reference existing (usuario_id, post_id) from usuarios_posts
-- and (post_id, categoria_id) from posts_categorias
-- ------------------------------------------------------------
INSERT INTO usuarios_posts_categorias (usuario_id, post_id, categoria_id, voto) VALUES
(1, 2, 1, 1),   -- exists: (1,2) yes, (2,1) yes
(1, 5, 2, -1),  -- (1,5) yes, (5,2) yes
(1, 9, 1, 0),   -- (1,9) yes, (9,1) yes
(2, 3, 6, 1),   -- (2,3) yes, (3,6) yes
(2, 6, 3, 1),   -- (2,6) yes, (6,3) yes
(2, 10, 1, -1), -- (2,10) yes, (10,1) yes
(2, 15, 1, 1),  -- (2,15) yes, (15,1) yes
(3, 1, 3, 0),   -- (3,1) yes, (1,3) yes
(3, 7, 4, 1),   -- (3,7) yes, (7,4) yes
(3, 11, 3, -1), -- (3,11) yes, (11,3) yes
(4, 4, 2, 1),   -- (4,4) yes, (4,2) yes
(4, 8, 1, 0),   -- (4,8) yes, (8,1) yes
(4, 12, 3, 1),  -- (4,12) yes, (12,3) yes
(4, 16, 3, -1), -- (4,16) yes, (16,3) yes
(5, 5, 5, 1),   -- (5,5) yes, (5,5) yes
(5, 13, 6, 0),  -- (5,13) yes, (13,6) yes
(5, 17, 2, 1),  -- (5,17) yes, (17,2) yes
(6, 6, 1, -1),  -- (6,6) yes, (6,1) yes
(6, 14, 1, 1),  -- (6,14) yes, (14,1) yes
(6, 18, 4, 1);  -- (6,18) yes, (18,4) yes

-- ------------------------------------------------------------
-- 14. CURSOS_POSTS (each course contains 2-3 other posts)
-- curso_id references cursos(post_id), i.e. 1, 2, or 3
-- post_id references posts(id) – avoid using 1,2,3 themselves
-- ------------------------------------------------------------
INSERT INTO cursos_posts (curso_id, post_id) VALUES
(1, 4), (1, 5), (1, 6),   -- Curso 1 (Python) contains artigos
(2, 7), (2, 8), (2, 9),   -- Curso 2 (SQL) contém artigo + questionário
(3, 10), (3, 11), (3, 12), (3, 13); -- Curso 3 (Fotografia) contém questionários
