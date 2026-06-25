CREATE TABLE usuarios (
    id bigint auto_increment primary key,
    nome varchar(200) not null,
    email varchar(200) not null unique,
    senha varchar(200) not null,
    foto varchar(255) null,
    biografia text null
);

CREATE TABLE usuarios_amigos (
    id bigint unique auto_increment,
    usuario_id bigint not null,
    amigo_id bigint not null,
    criado_em timestamp default current_timestamp,
    foreign key (usuario_id) references usuarios(id),
    foreign key (amigo_id) references usuarios(id),
    primary key (usuario_id, amigo_id)
);

CREATE TABLE feeds (
    id bigint auto_increment primary key,
    usuario_id bigint not null,
    titulo varchar(200) not null,
    descricao text null,
    ultimo_feed_ativo boolean not null default false,
    foreign key (usuario_id) references usuarios(id)
);

CREATE TABLE posts (
    id bigint auto_increment primary key,
    usuario_id bigint not null,
    foreign key (usuario_id) references usuarios(id),
    titulo varchar(200) null,
    data_criacao date not null,
    tipo smallint not null
    -- nivel_publicidade enum('publico', 'privado') -- Não ideal fazer isso!
);

CREATE TABLE usuarios_posts (
    id bigint unique auto_increment,
    usuario_id bigint not null,
    post_id bigint not null,
    foreign key (usuario_id) references usuarios(id),
    foreign key (post_id) references posts(id),
    primary key (usuario_id, post_id)

    -- favorito boolean not null
);

CREATE TABLE categorias (
    id bigint auto_increment primary key,
    nome varchar(200) not null unique
    -- descricao text not null
);

-- CREATE TABLE categorias_categorias (
--     id bigint auto_increment not null unique,
--     categoria_id bigint not null,
--     subcategoria_id bigint not null,
--     votos bigint not null,
--     foreign key (categoria_id) references categorias(id),
--     foreign key (subcategoria_id) references categorias(id),
--     primary key (categoria_id, subcategoria_id)
-- );



CREATE TABLE feeds_categorias(
    id bigint auto_increment,
    feed_id bigint not null,
    categoria_id bigint not null,
    foreign key (feed_id) references feeds(id),
    foreign key (categoria_id) references categorias(id),
    primary key (feed_id, categoria_id),
    unique key (id)
);

CREATE TABLE posts_categorias(
    id bigint auto_increment,
    post_id bigint not null,
    categoria_id bigint not null,
    votos bigint not null default 0,
    foreign key (post_id) references posts(id),
    foreign key (categoria_id) references categorias(id),
    primary key (post_id, categoria_id),
    unique key (id)
);

CREATE TABLE usuarios_posts_categorias (
    id bigint unique auto_increment,
    usuario_id bigint not null,
    post_id bigint not null,
    categoria_id bigint not null,
    foreign key (usuario_id) references usuarios(id),
    foreign key (post_id) references posts(id),
    foreign key (categoria_id) references categorias(id),
    primary key (usuario_id, post_id, categoria_id),

    voto int null
);

-- CREATE TABLE comentarios (
--     id bigint auto_increment,
--     post_id bigint not null,
--     usuario_id bigint not null,
--     foreign key (usuario_id) references usuarios(id),
--     foreign key (post_id) references posts(id),

--     data_criacao date not null,
--     primary key (post_id, usuario_id),
--     unique key (id)
-- );

-- Tipos de post

CREATE TABLE cursos (
    post_id bigint not null,
    id bigint auto_increment primary key,
    foreign key (post_id) references posts(id)
);  

CREATE TABLE cursos_posts (
    curso_id bigint not null,
    post_id bigint not null,
    foreign key (curso_id) references cursos(post_id),
    foreign key (post_id) references posts(id),
    primary key (curso_id, post_id)
);

CREATE TABLE artigos (
    post_id bigint not null primary key,
    foreign key (post_id) references posts(id),
    corpo text not null,
    formato varchar(30) not null default 'markdown'
);

CREATE TABLE questionarios (
    post_id bigint not null primary key,
    foreign key (post_id) references posts(id)
);

CREATE TABLE atividades (
    post_id bigint not null primary key,
    foreign key (post_id) references posts(id),
    enunciado text not null,
    texto text null,
    resposta_certa int not null,
    explicacao text null
);

CREATE TABLE opcoes(
    id bigint auto_increment primary key,
    ordem int not null,
    atividade_id bigint not null,
    texto text not null,
    foreign key (atividade_id) references atividades(post_id)
);

CREATE TABLE usuarios_cursos_favoritos (
    usuario_id bigint not null,
    curso_id bigint not null,
    foreign key (usuario_id) references usuarios(id),
    foreign key (curso_id) references cursos(post_id),
    primary key (usuario_id, curso_id)
);