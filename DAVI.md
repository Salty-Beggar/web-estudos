## Site de estudos ##

## o que sera o site de estudos?

Nele as pessoas podem pesquisar o que vao estudar por filtro tais como (geografia, historia, matematica, ciencias, musica, violao, guitarra,culinaria etc).
Os generos sao criados pelos usuarios e os subgeneros sao criados pelosusuarios tambem, quanto mais utilizado e mais citado o genero mais ele apa-recera quando pesquisarem (digamos que vc va na tela inicial filtrar por assuntos aparecerao os que mais foram utilizados evitando que aparecam mui-tas coisas como "pornografia" etc ). 
Assim como a ligacao entre generos pode ocorer quando um genero esta ligado a outro muitas vezes(exemplo historia e historia antiga sao citados muitas vezes assim na primeira vez citados juntos sera criada uma tabela de ligacao com nivel de ligacao e quanto maior o nivel maior a chance de apar-ecer ao filtrar. ex: muitas vezes matematica com logaritimo assim ao pesquisar por um ou outro tem mais chances de aparecer o outro.) 

Nele poderaoser postados videos, textos, imagens, arquivos.pdf cursos(entre ou-tros que possam guardar informações) etc.O usuario pode relacionar um genero ao post mas ele pode mudar dependendo dos votos dos usuarios, se um genero for relacionado a questao muitas vezes ele tera mais chances de aparecer ao pesquisar por aquele genero.
O item postado pode ser votado como bom ou ruim e pode ser votado por genero ent se um genero nao for tao relacionado ao que a questao traz ele aparecera menos vezes ao pesquisar pelo genero. As pessoas podem ligar um genero a uma questao e quanto mais vezes isso ocorrer mais forte sera a ligacao entre eles e mais chances de aparecer ao pesquisar por um ou outro.

## regras de negocio 
O usuario so pode criar um curso ou favoritar um post votar e comentar apenas se estiver logado, mas ele pode pesquisar sem estar logado. apenas administradores e moderadores podem apagar comentarios posts de outros usuarios, administradores podem apagar generos e subgenetos. um usuario nao pode apagar a conta de outro usuario mas pode apagar a propria conta. um usuario nao pode votar mais de uma vez em um mesmo post ou genero. um usuario nao pode votar em um post ou genero que ele mesmo criou. um usuario nao pode seguir a si mesmo. um usuario nao pode dar like em um post que ele mesmo criou.  um usuario nao pode criar um genero ou subgenero com o mesmo nome de outro genero ou subgenero existente. 
a senha deve conter no minimo 8 caracteres, uma letra maiuscula, uma letra minuscula e um numero. o email deve ser unico. o nome de usuario deve ser unico.

## tabelas do banco de dados
- usuarios 
- generos
- cursos
- questoes
- alternativas
- provas
- servidores
- grupos
- conversas
- arquivos(pdf txt etc pra guardar informacoes, mesmo que nao estejam no banco tem que ter consciencia deles)
- videos(o mesmo que o de cima)
- comentarios

## ligacao com usuarios
- usuario_amigos(se o usuario adicionar amigo ao favoritos aparece na pagina inicial)
- usuario_genero(pra evitar que espamem generos pra repetir por exemplo "pornografia" com facilidade)

- usuario_curso
- usuario_curso_voto
- usuario_curso_favorito

- usuario_questao
- usuario_questao_voto(questoes nao sao favoritadas mas podem ser inseridas em um curso proprio)

- usuario_prova
- usuario_prova_voto

- usuario_servidor(ligacao pode ser de nivel: membro, moderador, administrador)
- usuario_servidor_favorito(servidores podem ser favoritados para aparecer na pagina inicial)

- usuario_grupo(usuarios podem favoritar grupos e se esse grupo for apagado do servidor apaga a ligacao entre usuario e grupo pois ele pertence a um servidor)
- usuario_grupo_favorito(grupos podem ser favoritados para aparecer na pagina inicial)

- usuario_conversas(usuarios podem liagr usuarios a conversas que pertencem a servidores de o grupo onde a conversa esta ou o servoder onde o grupo esta for apagado a ligacao e aparaga)
- usuario_conversas_favoritas(leva pro servidor onde a conversa esta ou o grupo onde a conversa esta ou o servidor onde o grupo esta)

- usuarios_videos
- usuarios_arquivos
- usuarios_comentarios

##  ligacao com generos
- genero_genero_voto(essas tabelas sao feitas para dizer quao ligadas estao as outras em contem o usuario que votou na ligacao)
- genero_curso_voto
- genero_questao_voto
- genero_prova_voto
- genero_servidor_voto
- genero_arquivo_voto
- genero_video_voto
