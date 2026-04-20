CREATE TABLE usuarios (
    id bigint auto_increment primary key,
    nome varchar(200) not null,
    email varchar(200) not null,
    senha varchar(200) not null,
    foto varchar(200) not null
);

CREATE TABLE usuarios_posts (
    id bigint unique auto_increment,
    
);

CREATE TABLE posts (
    id bigint auto_increment primary key,
    titulo varchar(200) null
);

CREATE TABLE posts_mensagens (
    id bigint auto_increment primary key,
    post_id bigint not null,
    usuario_id bigint not null,
    foreign key (post_id) references (posts.id),
    foreign key (usuario_id) references (usuarios.id)
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

CREATE TABLE categorias (
    id bigint not null,
    nome varchar(200) not null,
);

CREATE TABLE categorias_categorias (
    id bigint not null unique,
    categoria_id bigint not null,
    subcategoria_id bigint not null,
    votos bigint not null,
    foreign key (categoria_id, subcategoria_id) references (categorias.id),
    primary key (categoria_id, subcategoria_id)
);



