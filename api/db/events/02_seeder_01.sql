-- ============================================================
-- SEEDER for the given MariaDB schema
-- (run this after your migration)
-- ============================================================

-- ------------------------------------------------------------
-- 1. USUÁRIOS (20 rows)
-- ------------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha, foto, biografia) VALUES
(1, 'Ana Silva', 'ana.silva@email.com', 'aGFzaF9hbmExMjM=', '/assets/imgs/users/avatar-01.svg', 'Gosta de programação web, banco de dados e projetos do IFRS.'),
(2, 'Bruno Costa', 'bruno.costa@email.com', 'aGFzaF9icnVubzQ1Ng==', '/assets/imgs/users/avatar-02.svg', 'Curte SQL, redes e tecnologia.'),
(3, 'Carla Mendes', 'carla.m@email.com', 'aGFzaF9jYXJsYTc4OQ==', '/assets/imgs/users/avatar-03.svg', 'Estuda educação, design e fotografia.'),
(4, 'Diego Souza', 'diego.s@email.com', 'aGFzaF9kaWVnbzEwMQ==', '/assets/imgs/users/avatar-04.svg', 'Escreve artigos sobre bem-estar e produtividade.'),
(5, 'Elena Ferreira', 'elena.f@email.com', 'aGFzaF9lbGVuYTExMg==', '/assets/imgs/users/avatar-05.svg', 'Acompanha saúde, esportes e rotina.'),
(6, 'Felipe Rocha', 'felipe.r@email.com', 'aGFzaF9mZWxpcGUxMzE=', '/assets/imgs/users/avatar-06.svg', 'Pesquisa economia circular e sustentabilidade.'),
(7, 'Gabriela Lima', 'gabi.l@email.com', 'aGFzaF9nYWJpNDE1', '/assets/imgs/users/avatar-07.svg', 'Aprende finanças e investimentos.'),
(8, 'Henrique Alves', 'henrique.a@email.com', 'aGFzaF9oZW5yaXF1ZTE2MQ==', '/assets/imgs/users/avatar-08.svg', 'Interessa-se por trabalho remoto e tecnologia.'),
(9, 'Isabela Pereira', 'isabela.p@email.com', 'aGFzaF9pc2FiZWxhNzE4', '/assets/imgs/users/avatar-09.svg', 'Gosta de lógica e desafios.'),
(10, 'João Oliveira', 'joao.o@email.com', 'aGFzaF9qb2FvMTkx', '/assets/imgs/users/avatar-10.svg', 'Pratica HTML, CSS e JavaScript.'),
(11, 'Karina Santos', 'karina.s@email.com', 'aGFzaF9rYXJpbmEyMDI=', '/assets/imgs/users/avatar-11.svg', 'Compartilha conhecimentos gerais.'),
(12, 'Leonardo Martins', 'leo.m@email.com', 'aGFzaF9sZW8yMTI=', '/assets/imgs/users/avatar-12.svg', 'Estuda matemática.'),
(13, 'Mariana Castro', 'mariana.c@email.com', 'aGFzaF9tYXJpYW5hMjIz', '/assets/imgs/users/avatar-13.svg', 'Organiza pesquisas e questionários.'),
(14, 'Nicolas Ferreira', 'nicolas.f@email.com', 'aGFzaF9uaWNvbGFzMjM0', '/assets/imgs/users/avatar-14.svg', 'Monta PCs e hardware.'),
(15, 'Olívia Gomes', 'olivia.g@email.com', 'aGFzaF9vbGl2aWEyNDU=', '/assets/imgs/users/avatar-15.svg', 'Cria APIs REST.'),
(16, 'Paulo Henrique', 'paulo.h@email.com', 'aGFzaF9wYXVsbzI1Ng==', '/assets/imgs/users/avatar-16.svg', 'Treina escrita e redação.'),
(17, 'Quintina Melo', 'quintina.m@email.com', 'aGFzaF9xdWludGluYTI2Nw==', '/assets/imgs/users/avatar-17.svg', 'Estuda saúde e cálculos simples.'),
(18, 'Rafaela Nunes', 'rafaela.n@email.com', 'aGFzaF9yYWZhZWxhMjc4', '/assets/imgs/users/avatar-18.svg', 'Organiza finanças.'),
(19, 'Samuel Dias', 'samuel.d@email.com', 'aGFzaF9zYW11ZWwyODk=', '/assets/imgs/users/avatar-19.svg', 'Analisa dados.'),
(20, 'Tatiane Rocha', 'tatiane.r@email.com', 'aGFzaF90YXRpYW5lMjkw', '/assets/imgs/users/avatar-20.svg', 'Cria blogs e conteúdos.');


-- ------------------------------------------------------------
-- 1.1. USUARIOS_AMIGOS
-- relação usuário com usuário; inserida nos dois sentidos para ficar simples no front
-- ------------------------------------------------------------
INSERT INTO usuarios_amigos (usuario_id, amigo_id) VALUES
(1, 2), (2, 1),
(1, 3), (3, 1),
(1, 10), (10, 1),
(1, 15), (15, 1),
(2, 3), (3, 2);

-- ------------------------------------------------------------
-- 2. CATEGORIAS (120+ temas de estudo)
-- O site é de estudos gerais, então o seed já vem com bastante variedade.
-- Usuários ainda podem criar novas categorias pela rota POST /categoria/add.
-- ------------------------------------------------------------
INSERT INTO categorias (id, nome) VALUES
(1, 'Tecnologia'),
(2, 'Saúde'),
(3, 'Educação'),
(4, 'Finanças'),
(5, 'Esportes'),
(6, 'Entretenimento'),
(7, 'Programação'),
(8, 'PHP'),
(9, 'JavaScript'),
(10, 'HTML'),
(11, 'CSS'),
(12, 'Banco de Dados'),
(13, 'SQL'),
(14, 'MySQL'),
(15, 'APIs'),
(16, 'Backend'),
(17, 'Frontend'),
(18, 'Git e GitHub'),
(19, 'Docker'),
(20, 'Linux'),
(21, 'Windows'),
(22, 'Redes de Computadores'),
(23, 'Segurança da Informação'),
(24, 'Lógica de Programação'),
(25, 'Algoritmos'),
(26, 'Estrutura de Dados'),
(27, 'Matemática'),
(28, 'Álgebra'),
(29, 'Geometria'),
(30, 'Trigonometria'),
(31, 'Estatística'),
(32, 'Probabilidade'),
(33, 'Física'),
(34, 'Eletricidade'),
(35, 'Mecânica'),
(36, 'Química'),
(37, 'Biologia'),
(38, 'Genética'),
(39, 'História'),
(40, 'Geografia'),
(41, 'Sociologia'),
(42, 'Filosofia'),
(43, 'Português'),
(44, 'Redação'),
(45, 'Inglês'),
(46, 'Inglês Técnico'),
(47, 'Espanhol'),
(48, 'Artes'),
(49, 'Literatura'),
(50, 'Interpretação de Texto'),
(51, 'ENEM'),
(52, 'IFRS'),
(53, 'Projeto Integrador'),
(54, 'TCC'),
(55, 'Pesquisa Científica'),
(56, 'Metodologia'),
(57, 'Robótica'),
(58, 'Arduino'),
(59, 'Inteligência Artificial'),
(60, 'Machine Learning'),
(61, 'Ciência de Dados'),
(62, 'Planilhas'),
(63, 'Excel'),
(64, 'Power BI'),
(65, 'UX/UI Design'),
(66, 'Design Gráfico'),
(67, 'Fotografia'),
(68, 'Edição de Vídeo'),
(69, 'Música'),
(70, 'Cinema'),
(71, 'Jogos'),
(72, 'Gamedev'),
(73, 'Mobile'),
(74, 'Android'),
(75, 'Kotlin'),
(76, 'Python'),
(77, 'Java'),
(78, 'C'),
(79, 'C++'),
(80, 'C#'),
(81, 'Node.js'),
(82, 'Express'),
(83, 'Laravel'),
(84, 'Orientação a Objetos'),
(85, 'Padrões de Projeto'),
(86, 'Testes de Software'),
(87, 'DevOps'),
(88, 'Cloud'),
(89, 'AWS'),
(90, 'Hardware'),
(91, 'Manutenção de Computadores'),
(92, 'Vôlei'),
(93, 'Calistenia'),
(94, 'Sono e Recuperação'),
(95, 'Nutrição'),
(96, 'Produtividade'),
(97, 'Organização de Estudos'),
(98, 'Memorização'),
(99, 'Xadrez'),
(100, 'Empreendedorismo'),
(101, 'Economia'),
(102, 'Política'),
(103, 'Meio Ambiente'),
(104, 'Sustentabilidade'),
(105, 'Atualidades'),
(106, 'Carreira'),
(107, 'Estágio'),
(108, 'Portfólio'),
(109, 'Comunicação'),
(110, 'Apresentações'),
(111, 'Ética Digital'),
(112, 'Acessibilidade'),
(113, 'Inclusão'),
(114, 'Psicologia'),
(115, 'Bem-estar'),
(116, 'Primeiros Socorros'),
(117, 'Direito Digital'),
(118, 'Privacidade'),
(119, 'Criptografia'),
(120, 'Blockchain'),
(121, 'Astronomia'),
(122, 'Geologia'),
(123, 'Agricultura'),
(124, 'Culinária'),
(125, 'Administração'),
(126, 'Marketing Digital');

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
(20, 20, 'Atividade: Criação de um blog', '2025-06-01', 4),
(21, 1, 'Como organizar uma API em PHP', '2026-06-12', 2),
(22, 1, 'Guia rápido de rotas no front-end', '2026-06-13', 2),
(23, 1, 'Curso prático de Banco de Dados', '2026-06-14', 1),
(24, 1, 'Atividade: criar um feed personalizado', '2026-06-15', 4),
(25, 1, 'Questionário de JavaScript básico', '2026-06-16', 3),
(26, 1, 'Como estudar inglês técnico todo dia', '2026-06-17', 2),
(27, 1, 'Treino leve e recuperação no vôlei', '2026-06-18', 2),
(28, 1, 'Projeto Integrador: documentação e entregas', '2026-06-19', 2);

-- ------------------------------------------------------------
-- 4. CURSOS (subtype for post tipo=1)
-- ------------------------------------------------------------
INSERT INTO cursos (post_id) VALUES
(1), (2), (3), (23);

-- ------------------------------------------------------------
-- 5. ARTIGOS (subtype for post tipo=2)
-- ------------------------------------------------------------
INSERT INTO artigos (post_id, corpo, formato) VALUES
(4, '# Como manter a calma em crise

Em momentos de crise, o primeiro passo é **diminuir a velocidade da reação**. A ideia não é ignorar o problema, mas ganhar alguns segundos para pensar melhor.

## Passos rápidos

- Respire fundo por alguns ciclos.
- Nomeie o que está acontecendo.
- Separe o que é urgente do que pode esperar.
- Escolha uma ação pequena e possível.

> Calma não significa ausência de problema. Significa conseguir agir mesmo com o problema existindo.

Use *anotações curtas* para descarregar a cabeça e voltar para a situação com mais clareza.', 'markdown'),
(5, '# 5 hábitos para uma vida saudável

Uma rotina saudável não precisa começar perfeita. Ela funciona melhor quando é **simples**, repetível e ajustada ao dia real da pessoa.

## Hábitos principais

1. Dormir em horários parecidos.
2. Beber água durante o dia.
3. Comer comida de verdade na maior parte das refeições.
4. Fazer alguma atividade física.
5. Ter pausas para descansar a mente.

O mais importante é manter *constância*, não tentar mudar tudo em um único dia.', 'markdown'),
(6, '# Entendendo a economia circular

A economia circular tenta trocar a lógica de comprar, usar e descartar por um ciclo de **reuso**, reparo e reaproveitamento.

## Ideias centrais

- Reduzir desperdício.
- Aumentar a vida útil dos produtos.
- Reaproveitar materiais.
- Pensar no impacto desde o projeto.

Na prática, isso aparece em reciclagem, conserto de equipamentos, logística reversa e consumo mais consciente.', 'markdown'),
(7, '# Investimentos para iniciantes

Investir começa antes de escolher um produto. Primeiro vem a organização do dinheiro e a criação de uma reserva.

## Ordem segura para começar

1. Entender quanto entra e quanto sai.
2. Quitar dívidas caras.
3. Montar uma reserva de emergência.
4. Estudar renda fixa.
5. Só depois pensar em mais risco.

Para iniciantes, o foco deve ser **segurança e aprendizado**, não promessa de ganho rápido.', 'markdown'),
(8, '# O futuro do trabalho remoto

O trabalho remoto mostrou que muitas tarefas não dependem de estar no mesmo prédio. Mesmo assim, ele exige organização e comunicação clara.

## Pontos positivos

- Menos tempo em deslocamento.
- Mais flexibilidade.
- Possibilidade de trabalhar com equipes de outros lugares.

## Dificuldades

- Isolamento.
- Mistura entre casa e trabalho.
- Comunicação mal explicada.

O futuro tende a ser mais *híbrido*, combinando presença e distância conforme a necessidade.', 'markdown'),
(21, '# Como organizar uma API em PHP

Uma API fica mais fácil de manter quando cada parte tem uma responsabilidade clara. Isso evita que uma mudança pequena no banco quebre o front inteiro.

## Estrutura recomendada

- **Rotas**: decidem qual controller será chamado.
- **Controllers**: recebem a requisição e validam o básico.
- **Models**: representam tabelas e dados.
- **Banco**: executa consultas e salva informações.

## Exemplo de fluxo

1. O front chama `POST /feed/add`.
2. A rota chama o `FeedController`.
3. O controller valida título e categorias.
4. O model salva o feed.
5. A tabela de ligação salva as categorias do feed.

Com isso, o front só precisa mandar os dados certos e receber um JSON limpo.', 'markdown'),
(22, '# Guia rápido de rotas no front-end

No front, a rota serve para abrir a tela certa sem precisar recarregar tudo. Em um SPA simples, o JavaScript lê a URL e decide qual página carregar.

## O que uma rota precisa fazer

- Identificar o caminho atual.
- Carregar o HTML da página.
- Importar o JS daquela página.
- Chamar a API necessária.
- Tratar erro sem quebrar a tela.

Um exemplo seria `/Post/21`, onde o número final é usado para buscar os dados do post na API.', 'markdown'),
(26, '# Como estudar inglês técnico todo dia

Inglês técnico melhora muito quando o estudo aparece dentro da programação real. Ler documentação é difícil no começo, mas fica mais natural com repetição.

## Treino simples

- Leia um trecho curto de documentação.
- Marque palavras que aparecem muito.
- Veja exemplos de código.
- Escreva uma frase usando uma palavra nova.

Palavras como `request`, `response`, `string`, `array` e `return` aparecem tanto que viram vocabulário automático com o tempo.', 'markdown'),
(27, '# Treino leve e recuperação no vôlei

Treinar forte todos os dias pode parecer bom, mas o corpo também precisa de recuperação para adaptar o movimento e recuperar os músculos.

## Em dias de cansaço

- Treine toque leve.
- Faça mobilidade.
- Revise movimento sem impacto.
- Evite saltos repetidos se a perna estiver dolorida.

O objetivo é continuar evoluindo sem transformar fadiga em lesão. Treino bom também pode ser *controle e técnica*.', 'markdown'),
(28, '# Projeto Integrador: documentação e entregas

Um projeto fica mais fácil de apresentar quando as decisões estão documentadas. A documentação mostra o que foi feito, por que foi feito e como testar.

## O que documentar

- Diagrama do banco.
- Rotas da API.
- Telas principais.
- Seeds usados para demonstração.
- Problemas encontrados e correções.

Na sprint, não basta dizer que funcionou. É melhor mostrar **o caminho completo**, do banco até o front.', 'markdown');

-- ------------------------------------------------------------
-- 6. QUESTIONARIOS (subtype for post tipo=3)
-- ------------------------------------------------------------
INSERT INTO questionarios (post_id) VALUES
(9), (10), (11), (12), (13), (25);

-- ------------------------------------------------------------
-- 7. ATIVIDADES (subtype for post tipo=4)
-- resposta_certa guarda a ordem da alternativa correta, de 1 a 4.
-- ------------------------------------------------------------
INSERT INTO atividades (post_id, enunciado, texto, resposta_certa, explicacao) VALUES
(14, 'Em uma montagem básica de computador, qual componente define quais processadores e memórias podem ser usados?', 'Leia o cenário: você precisa montar um PC simples para estudos e quer evitar incompatibilidade entre as peças. Pense em qual peça funciona como base de conexão entre processador, memória, armazenamento e demais componentes.', 2, 'A placa-mãe define o soquete do processador, o tipo de memória RAM suportado e várias conexões internas do computador.'),
(15, 'Qual rota representa melhor uma consulta REST para listar usuários em formato JSON?', 'Uma API REST costuma usar o método HTTP de acordo com a intenção da ação. Para buscar uma lista sem alterar dados, o método mais adequado é aquele usado para leitura.', 1, 'GET é o método mais comum para consultar dados sem criar, alterar ou apagar registros.'),
(16, 'Qual alternativa apresenta uma tese adequada para iniciar uma redação dissertativa?', 'A tese precisa defender uma ideia central clara. Ela não deve ser apenas um tema solto nem uma pergunta sem posição. Escolha a alternativa que apresenta uma opinião organizada para ser defendida no texto.', 3, 'Uma boa tese apresenta ponto de vista claro e permite desenvolver argumentos nos parágrafos seguintes.'),
(17, 'Uma pessoa pesa 70 kg e tem 1,75 m de altura. Qual é o IMC aproximado?', 'Use a fórmula IMC = peso / altura². Primeiro calcule 1,75 × 1,75 e depois divida 70 pelo resultado.', 1, '1,75² = 3,0625. Então 70 / 3,0625 ≈ 22,86, valor dentro da faixa considerada normal para adultos.'),
(18, 'Com renda de R$ 3000, despesas fixas de R$ 2100 e despesas variáveis de R$ 600, quanto sobra no mês?', 'Some as despesas e subtraia da renda. Essa atividade treina organização financeira básica e leitura de orçamento mensal.', 2, 'As despesas somam R$ 2700. Como a renda é R$ 3000, sobram R$ 300.'),
(19, 'Em Python, qual comando é mais direto para ler um arquivo CSV em uma tabela usando pandas?', 'Considere que a biblioteca pandas já foi importada como pd. A pergunta pede a forma mais comum para transformar o CSV em um DataFrame.', 1, 'pd.read_csv() lê um arquivo CSV e retorna um DataFrame, que pode ser filtrado, exibido e analisado.'),
(20, 'Qual conjunto de elementos deixa a estrutura inicial de um blog mais semântica?', 'Um blog simples pode ter cabeçalho, área principal, artigos e rodapé. A semântica ajuda o navegador e outras ferramentas a entenderem melhor o conteúdo.', 3, 'header, main, article e footer indicam o papel de cada parte da página com mais clareza do que usar apenas divs.'),
(24, 'Qual é o fluxo correto para criar um feed personalizado ligado ao usuário logado?', 'O feed precisa ter título, pertencer ao usuário atual e possuir pelo menos uma categoria. Depois da criação, a tela precisa atualizar a lista para mostrar o feed novo.', 1, 'O fluxo correto cria o feed com usuário, título, descrição opcional e categorias, depois recarrega os feeds no front.');

-- ------------------------------------------------------------
-- 8. OPCOES (4 opções para cada atividade)
-- ------------------------------------------------------------
INSERT INTO opcoes (ordem, atividade_id, texto) VALUES
-- Atividade 14
(1, 14, 'O gabinete, porque ele define o tamanho externo do computador.'),
(2, 14, 'A placa-mãe, porque ela define soquete, memória e conexões compatíveis.'),
(3, 14, 'O monitor, porque ele define a resolução da imagem.'),
(4, 14, 'O teclado, porque ele envia comandos para o sistema.'),
-- Atividade 15
(1, 15, 'GET /usuarios'),
(2, 15, 'POST /usuarios'),
(3, 15, 'PUT /usuarios/1'),
(4, 15, 'DELETE /usuarios/1'),
-- Atividade 16
(1, 16, 'Redes sociais existem há bastante tempo.'),
(2, 16, 'Será que as redes sociais fazem mal?'),
(3, 16, 'O uso excessivo das redes sociais pode prejudicar a concentração dos estudantes.'),
(4, 16, 'Neste texto eu vou falar sobre internet.'),
-- Atividade 17
(1, 17, 'IMC ≈ 22,86'),
(2, 17, 'IMC ≈ 25,00'),
(3, 17, 'IMC ≈ 18,50'),
(4, 17, 'IMC ≈ 30,00'),
-- Atividade 18
(1, 18, 'Sobram R$ 100.'),
(2, 18, 'Sobram R$ 300.'),
(3, 18, 'Faltam R$ 300.'),
(4, 18, 'Sobram R$ 900.'),
-- Atividade 19
(1, 19, 'pd.read_csv("dados.csv")'),
(2, 19, 'pd.open_csv("dados.csv")'),
(3, 19, 'csv.to_pandas("dados.csv")'),
(4, 19, 'read.table.csv("dados.csv")'),
-- Atividade 20
(1, 20, 'div, div, div e span'),
(2, 20, 'table, tr, td e center'),
(3, 20, 'header, main, article e footer'),
(4, 20, 'script, link, meta e title'),
-- Atividade 24
(1, 24, 'Enviar título, descrição e categorias para a API, salvar com usuario_id e recarregar os feeds.'),
(2, 24, 'Salvar somente o título do feed, sem usuário e sem categorias.'),
(3, 24, 'Criar categorias soltas, mas não ligar nenhuma delas ao feed.'),
(4, 24, 'Atualizar apenas o HTML da tela sem chamar o backend.');

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
(10, 10, 'Startups & Negócios', 'Empreendedorismo e inovação'),
(11, 1, 'Programação Web', 'PHP, JavaScript, rotas e integração com API'),
(12, 1, 'Banco de Dados e APIs', 'SQL, models, controllers e organização do backend'),
(13, 1, 'Estudos IFRS', 'Conteúdos, trabalhos e revisões do curso técnico'),
(14, 1, 'Inglês Técnico', 'Leitura e vocabulário técnico para programação'),
(15, 1, 'Vôlei e Recuperação', 'Treino, descanso e evolução no esporte');

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
(9, 3),
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25), (1, 26), (1, 27), (1, 28);

-- ------------------------------------------------------------
-- 11. FEEDS_CATEGORIAS
-- Feeds com várias categorias para testar filtros amplos e diversos.
-- ------------------------------------------------------------
INSERT INTO feeds_categorias (feed_id, categoria_id) VALUES
(1, 1),
(1, 3),
(1, 7),
(1, 9),
(1, 10),
(1, 17),
(1, 24),
(1, 51),
(1, 104),
(1, 105),
(2, 2),
(2, 93),
(2, 94),
(2, 95),
(2, 96),
(2, 112),
(2, 113),
(2, 116),
(3, 3),
(3, 43),
(3, 44),
(3, 45),
(3, 50),
(3, 51),
(3, 52),
(3, 55),
(3, 56),
(3, 97),
(3, 98),
(4, 4),
(4, 31),
(4, 62),
(4, 63),
(4, 100),
(4, 101),
(4, 125),
(4, 126),
(5, 5),
(5, 92),
(5, 93),
(5, 94),
(5, 95),
(5, 112),
(5, 113),
(6, 6),
(6, 48),
(6, 49),
(6, 68),
(6, 69),
(6, 70),
(6, 71),
(6, 72),
(7, 33),
(7, 36),
(7, 37),
(7, 38),
(7, 55),
(7, 59),
(7, 60),
(7, 61),
(7, 119),
(7, 120),
(8, 39),
(8, 40),
(8, 41),
(8, 42),
(8, 101),
(8, 103),
(8, 111),
(8, 124),
(9, 102),
(9, 103),
(9, 120),
(9, 121),
(9, 122),
(9, 123),
(9, 125),
(10, 1),
(10, 4),
(10, 15),
(10, 57),
(10, 58),
(10, 82),
(10, 88),
(10, 89),
(10, 99),
(10, 100),
(10, 108),
(11, 7),
(11, 8),
(11, 9),
(11, 10),
(11, 11),
(11, 15),
(11, 16),
(11, 17),
(11, 18),
(11, 24),
(11, 25),
(11, 82),
(11, 84),
(11, 85),
(11, 86),
(12, 12),
(12, 13),
(12, 14),
(12, 15),
(12, 16),
(12, 22),
(12, 23),
(12, 61),
(12, 62),
(12, 64),
(12, 81),
(12, 82),
(12, 87),
(12, 88),
(12, 90),
(13, 27),
(13, 33),
(13, 36),
(13, 37),
(13, 39),
(13, 43),
(13, 44),
(13, 45),
(13, 50),
(13, 51),
(13, 52),
(13, 53),
(13, 54),
(13, 55),
(13, 56),
(13, 97),
(13, 98),
(13, 104),
(14, 45),
(14, 46),
(14, 47),
(14, 50),
(14, 51),
(14, 67),
(14, 104),
(14, 105),
(14, 106),
(15, 5),
(15, 92),
(15, 93),
(15, 94),
(15, 95),
(15, 96),
(15, 112),
(15, 113);

-- ------------------------------------------------------------
-- 12. POSTS_CATEGORIAS
-- Cada post recebeu várias categorias para gerar feeds mais vivos.
-- ------------------------------------------------------------
INSERT INTO posts_categorias (post_id, categoria_id, votos) VALUES
(1, 1, 51),
(1, 3, 44),
(1, 7, 35),
(1, 24, 53),
(1, 25, 47),
(1, 77, 30),
(1, 104, 38),
(2, 1, 48),
(2, 4, 40),
(2, 12, 27),
(2, 13, 21),
(2, 14, 55),
(2, 61, 43),
(2, 82, 17),
(3, 3, 43),
(3, 6, 35),
(3, 48, 28),
(3, 67, 44),
(3, 68, 38),
(3, 104, 37),
(4, 2, 41),
(4, 42, 36),
(4, 96, 17),
(4, 112, 36),
(4, 113, 30),
(5, 2, 38),
(5, 5, 30),
(5, 93, 17),
(5, 94, 51),
(5, 95, 45),
(5, 96, 39),
(6, 1, 36),
(6, 3, 29),
(6, 56, 51),
(6, 101, 41),
(6, 102, 35),
(6, 103, 29),
(7, 4, 30),
(7, 31, 38),
(7, 100, 44),
(7, 101, 38),
(7, 126, 48),
(8, 1, 30),
(8, 6, 20),
(8, 88, 53),
(8, 89, 47),
(8, 99, 32),
(8, 107, 19),
(9, 1, 27),
(9, 3, 20),
(9, 24, 34),
(9, 25, 28),
(9, 27, 21),
(9, 31, 52),
(9, 98, 20),
(10, 1, 24),
(10, 6, 54),
(10, 9, 46),
(10, 10, 40),
(10, 11, 34),
(10, 17, 23),
(10, 24, 51),
(11, 3, 19),
(11, 39, 18),
(11, 40, 52),
(11, 41, 46),
(11, 43, 39),
(11, 50, 27),
(11, 51, 21),
(12, 3, 16),
(12, 4, 50),
(12, 27, 22),
(12, 28, 16),
(12, 29, 50),
(12, 30, 44),
(12, 31, 38),
(13, 3, 53),
(13, 55, 36),
(13, 56, 30),
(13, 97, 24),
(13, 98, 18),
(13, 106, 45),
(13, 6, 18),
(14, 1, 52),
(14, 3, 45),
(14, 19, 24),
(14, 20, 18),
(14, 73, 40),
(14, 90, 18),
(14, 91, 52),
(15, 1, 49),
(15, 7, 38),
(15, 15, 25),
(15, 16, 19),
(15, 81, 29),
(15, 82, 23),
(15, 84, 16),
(16, 3, 44),
(16, 43, 39),
(16, 44, 33),
(16, 50, 22),
(16, 51, 16),
(16, 105, 37),
(16, 106, 31),
(17, 2, 42),
(17, 27, 52),
(17, 31, 43),
(17, 93, 16),
(17, 95, 49),
(18, 1, 40),
(18, 4, 32),
(18, 31, 40),
(18, 62, 44),
(18, 63, 38),
(18, 100, 36),
(18, 125, 46),
(19, 1, 37),
(19, 31, 42),
(19, 60, 48),
(19, 61, 42),
(19, 62, 36),
(19, 64, 29),
(20, 1, 34),
(20, 6, 24),
(20, 10, 55),
(20, 11, 49),
(20, 71, 24),
(20, 73, 17),
(20, 107, 18),
(21, 1, 31),
(21, 7, 20),
(21, 8, 54),
(21, 12, 45),
(21, 15, 37),
(21, 16, 31),
(21, 24, 18),
(21, 84, 33),
(21, 85, 27),
(22, 1, 28),
(22, 7, 17),
(22, 9, 50),
(22, 10, 44),
(22, 11, 38),
(22, 17, 27),
(22, 24, 55),
(22, 65, 49),
(23, 1, 25),
(23, 4, 17),
(23, 7, 49),
(23, 12, 39),
(23, 13, 33),
(23, 14, 27),
(23, 15, 21),
(23, 16, 55),
(23, 82, 24),
(24, 1, 22),
(24, 3, 55),
(24, 7, 46),
(24, 15, 33),
(24, 17, 26),
(24, 53, 25),
(24, 65, 48),
(24, 86, 22),
(25, 1, 19),
(25, 6, 49),
(25, 7, 43),
(25, 9, 36),
(25, 24, 16),
(25, 25, 50),
(25, 98, 52),
(26, 3, 54),
(26, 45, 47),
(26, 46, 41),
(26, 50, 32),
(26, 51, 26),
(26, 104, 48),
(26, 105, 42),
(27, 2, 52),
(27, 5, 44),
(27, 92, 32),
(27, 93, 26),
(27, 94, 20),
(27, 95, 54),
(27, 96, 48),
(28, 1, 50),
(28, 3, 43),
(28, 44, 37),
(28, 51, 25),
(28, 53, 18),
(28, 54, 52),
(28, 55, 46),
(28, 56, 40),
(28, 106, 25);

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
(6, 18, 4, 1),  -- (6,18) yes, (18,4) yes
(1, 21, 1, 1),
(1, 22, 1, 1),
(1, 23, 1, 1),
(1, 24, 3, 1),
(1, 25, 1, 0),
(1, 26, 3, 1),
(1, 27, 5, 1),
(1, 28, 3, 1);

-- ------------------------------------------------------------
-- 14. CURSOS_POSTS (each course contains 2-3 other posts)
-- curso_id references cursos(post_id), i.e. 1, 2, or 3
-- post_id references posts(id) – avoid using 1,2,3 themselves
-- ------------------------------------------------------------
INSERT INTO cursos_posts (curso_id, post_id) VALUES
(1, 4), (1, 5), (1, 6),   -- Curso 1 (Python) contains artigos
(2, 7), (2, 8), (2, 9),   -- Curso 2 (SQL) contém artigo + questionário
(3, 10), (3, 11), (3, 12), (3, 13), -- Curso 3 (Fotografia) contém questionários
(23, 21), (23, 22), (23, 24), (23, 25); -- Curso 23 contém posts de programação
