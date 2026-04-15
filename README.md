# web-estudos
Trabalho da matéria Desenvolvimento de Sistemas.



<!-- oque tera no site (isso e do davi nao mexe) -->
sera um site de estudos com todos os generos de coisas que podem ser estudadas
 
o aplicativo pode ser usado com ou sem login

1... sem login => {
    o usuario entra no site ele pode pesquisar na pagina home e pesquisar pelo titulo materia etc do materia que deseja estudar tambem pode filtrar por genero subgenero os maiscitados ou digitar por um especifico a fim de achar entre os menos citados 
        --pode pesquisar
        --pode filtrar
        --nao pode salvar 
        --dar like 
        --seguir
        
}

ideia de como sera a estrutura --em desenvolvimento-- pra saber como estruturar o site.

function questao () => {//questao de historia antiga
    id : 10,
    autor_id: 1,
    postado_quando: "16/12/2008",
    titulo: "QUESTAO DE HISTORIA ANTIGA",
    informacoes: "A Idade Antiga é um período cujo marco inicial é o surgimento da escrita. Assinale a alternativa que indica corretamente a civilização que desenvolveu a primeira forma de escrita, conhecida como escrita cuneiforme:",
}
function alternativa () => {
    id: 1,
    questao_id: 10,
    texto: "Egípcia",
    correta: false
}
function genero () => {
    id: 1,
    nome: "Historia"
}
function subgenero () => {
    id: 1,
    nome: "Historia Antiga",
    genero_id: 1,
}
function questao_subgeneros () => {
    id: 1,
    questao_id: 10,
    subgenero_id: 1
}
function questao_generos () => {
    id: 1,
    questao_id: 10,
    genero_id: 1
}
function usuario () => {
    id: 1,
    nome: "Davi",
    email: "davi92ec@example.com",
    senha: "12345678",
}
function votos_usuario_questao () => {
    id: 1,
    usuario_id: 1,
    questao_id: 10,
    votos: "100"
}