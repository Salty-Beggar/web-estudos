
const paginas = document.getElementsByClassName('pagina');

function iniciarPaginas() {
    for (let index = 0; index < paginas.length; index++) {
        const element = paginas[index];
        element.style.visibility = 'hidden';
    }
}

let ultimaPagina = -1;
function carregarPagina(indice) {
    if (ultimaPagina != -1) paginas[ultimaPagina].style.visibility = 'hidden';
    paginas[indice].style.visibility = 'visible';
    ultimaPagina = indice;
}

iniciarPaginas();
carregarPagina(0);

function $id(a) { return document.getElementById(a) };

const divCursos = $id('MEUS-CURSOS');

const postagemBase = '';

const classificacoes = [
    'História',
    'Revolução Francesa',
    'Biologia',
    'Zoologia',
    'Redação',
    'Gramática'
]

const postagens = [
    {
        nome: 'Prova de História',
        usuario: 'Lucas Andrade da Silva',
        classificacoes: [
            {
                class: 0,
                rating: 800,
                votos: 3
            },
            {
                class: 1,
                rating: 200,
                votos: 3
            }
        ]
    },
    {
        nome: 'França: Tomada da bastilha',
        usuario: 'Lucas Andrade da Silva',
        classificacoes: [
            {
                class: 0,
                rating: 800,
                votos: 3
            }
        ]
    },
    {
        nome: 'Guerra Mundial',
        usuario: 'Lucas Andrade da Silva',
        classificacoes: [
            {
                class: 0,
                rating: 800,
                votos: 3
            },
            {
                class: 1,
                rating: 200,
                votos: 3
            }
        ]
    },
    {
        nome: 'Como escrever redações: inicio',
        usuario: 'Lucas Andrade da Silva',
        classificacoes: [
            {
                class: 4,
                rating: 300,
                votos: 5
            }
        ]
    }
]