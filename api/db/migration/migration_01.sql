CREATE TABLE usuarios (
    id bigint auto_increment primary key,
    nome varchar(200) not null,
    email varchar(200) not null,
    senha varchar(200) not null,
    foto varchar(200) not null,
    biografia text null
);

CREATE TABLE usuarios_posts (
    id bigint unique auto_increment,
    usuario_id bigint not null,
    post_id bigint not null,
    foreign key (usuario_id) references (usuarios.id),
    foreign key (post_id) references (posts.id),
    primary key (usuario_id, post_id),

    favorito boolean not null,
);

CREATE TABLE posts (
    id bigint auto_increment primary key,
    titulo varchar(200) null,
    data_criacao date not null,
    nivel_publicidade enum('publico', 'privado') -- Não ideal fazer isso!
);

CREATE TABLE usuarios_posts_categorias (
    id bigint unique auto_increment,
    usuario_id bigint not null,
    post_id bigint not null,
    categoria_id bigint not null,
    foreign key (usuario_id) references (usuarios.id),
    foreign key (post_id) references (posts.id),
    foreign key (categoria_id) references (categorias.id),
    primary key (usuario_id, post_id, categoria_id),

    voto int null,
);

CREATE TABLE posts_comentarios (
    id bigint auto_increment primary key,
    post_id bigint not null,
    usuario_id bigint not null,
    foreign key (post_id) references (posts.id),
    foreign key (usuario_id) references (usuarios.id),

    data_criacao date not null,
    primary key (post_id, usuario_id)
);

CREATE TABLE cursos (
    post_id bigint not null,
    id bigint auto_increment primary key,
    foreign key (post_id) references (posts.id)
);

CREATE TABLE artigos (
    post_id bigint not null,
    corpo text not null
);

CREATE TABLE posts_categorias(
    id bigint auto_increment unique,
    post_id bigint not null,
    categoria_id bigint not null,
    votos bigint not null,
    foreign key (post_id) references (posts.id),
    foreign key (categoria_id) references (categorias.id),
    primary key (post_id, categoria_id)
);

CREATE TABLE categorias (
    id bigint not null,
    nome varchar(200) not null,
    descricao text not null
);

CREATE TABLE categorias_categorias (
    id bigint not null unique,
    id bigint auto_increment not null unique,
    categoria_id bigint not null,
    subcategoria_id bigint not null,
    votos bigint not null,
    foreign key (categoria_id, subcategoria_id) references (categorias.id),
    primary key (categoria_id, subcategoria_id)
);

CREATE TABLE feeds (
    id bigint not null unique,
    usuario_id bigint not null,
    foreign key (usuario_id) references (usuarios.id),
);
CREATE TABLE usuarios_posts (
    id bigint auto_increment not null unique,
    usuario_id bigint not null,
    subcategoria_id bigint not null,
);

CREATE TABLE usuarios_posts_categorias (
    id bigint auto_increment not null unique,
    usuario_id bigint not null,
    post_id bigint not null,
    categoria_id bigint not null,
    voto int null,

);
