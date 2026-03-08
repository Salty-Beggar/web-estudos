
const paginas = [
    document.getElementsByClassName('pagina0')
];

function iniciarPaginas(pagIndex) {
    for (let index = 0; index < paginas[pagIndex].length; index++) {
        const element = paginas[pagIndex][index];
        element.style.visibility = 'hidden';
    }
}

let ultimaPagina = -1;
function carregarPagina(pagIndex, indice) {
    if (ultimaPagina != -1) paginas[pagIndex][ultimaPagina].style.visibility = 'hidden';
    paginas[pagIndex][indice].style.visibility = 'visible';
    ultimaPagina = indice;
}

iniciarPaginas(0);
// iniciarPaginas(1);
// iniciarPaginas(2);
// iniciarPaginas(3);

carregarPagina(0, 0);
// carregarPagina(1, 0);
// carregarPagina(2, 0);
// carregarPagina(3, 0);

function $id(a) { return document.getElementById(a) };

const divCursos = $id('MEUS-CURSOS');

const postagemBase = '';

const classificacoes = [
    'História',
    'Revolução Francesa',
    'Biologia',
    'Zoologia',
    'Redação',
    'Gramática',
    'Guerra Mundial',
    'Nazismo'
]

const postagens = [
    {
        nome: 'Prova de História',
        usuario: 'Lucas Andrade da Silva',
        cargo: 'Professor',
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
        nome: 'Maus: Desenhos fofos com história trágica',
        usuario: 'milly_103',
        cargo: 'Aluna',
        classificacoes: [
            {
                class: 6,
                rating: 800,
                votos: 7
            },
            {
                class: 7,
                rating: 200,
                votos: 8
            },
            {
                class: 0,
                rating: 700,
                votos: 15
            }
        ]
    },
    {
        nome: 'França: Tomada da bastilha',
        usuario: 'Luiza Carla',
        cargo: 'Hobbyista',
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
        usuario: 'Mario Mendonça',
        cargo: 'Aluno',
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
            },
            {
                class: 6,
                rating: 300,
                votos: 5
            }
        ]
    },
    {
        nome: 'Como escrever redações: inicio',
        usuario: 'Lucas Andrade da Silva',
        cargo: 'Professor',
        classificacoes: [
            {
                class: 4,
                rating: 300,
                votos: 5
            }
        ]
    },
    {
        nome: 'Gente oq é uma celula????',
        usuario: 'Pedro_Gamer',
        cargo: 'Aluno',
        classificacoes: [
            {
                class: 2,
                rating: 200,
                votos: 13
            },
            {
                class: 1,
                rating: 500,
                votos: 3
            }
        ]
    },
    {
        nome: 'Questão ENEM Invertebrados',
        usuario: 'Lucas Andrade da Silva',
        cargo: 'Professor',
        classificacoes: [
            {
                class: 2,
                rating: 1100,
                votos: 31
            },
            {
                class: 3,
                rating: 400,
                votos: 6
            }
        ]
    }
]

const postDiv = `<div id="feed-container-main">
                    <div id="feed-container" data-owner="feed-container">
                        <section class="feed-container-data">
                            <h2 class="container-tittle">:nome</h2><br>
                            <p class="container-type-user">Usuário: :usuario (:cargo)</p></br>
                            <p class="container-date">Data de postagem: 20/06/2026</p></br>
                            <p class="container-rating">
                                :classificacoes
                            </p><br>
                        <section>
                    </div>
                </div>`

const postClassDiv = `:nome: 
                        <ul>
                            <li>
                                Dificuldade: :dificuldade
                            </li>
                            <li>
                                Votos: :votos <button class='voto_mais'>+</button><button class='voto_menos'>-</button>
                            </li>
                        </ul>`

const feedHeader = $id('feed');
function gerarPosts() {

    postagens.sort((a, b) => {
        let aValue = 1;
        for (let i = 0; i < document.getElementsByClassName('class_check').length; i++) {
            if ($id('class_check_'+i).checked) {
                a.classificacoes.forEach(element => {
                    console.log(element.class, i);
                    if (element.class == i) {
                        aValue *= element.votos;
                    }
                });
            }
        }
        let bValue = 1;
        for (let i = 0; i < document.getElementsByClassName('class_check').length; i++) {
            if ($id('class_check_'+i).checked) {
                b.classificacoes.forEach(element => {
                    if (element.class == i) bValue *= element.votos;
                });
            }
        }

        return (aValue == bValue) ? 0 : (aValue > bValue) ? -1 : 1;
    });

    feedHeader.innerHTML = '';

    for (let i = 0; i < postagens.length; i++) {
        const postagemAtual = postagens[i];
        const classificacoesPostagem = postagemAtual.classificacoes;
        let classificacoesString = '';
        for (let j = 0; j < classificacoesPostagem.length; j++) {
            const classificacaoAtual = classificacoesPostagem[j];
            let strAtual = postClassDiv;
            strAtual = strAtual.replace(':nome', classificacoes[classificacaoAtual.class]);
            strAtual = strAtual.replace(':dificuldade', classificacaoAtual.rating);
            strAtual = strAtual.replace(':votos', classificacaoAtual.votos);
            classificacoesString += strAtual;
        }

        let postDivAtual = postDiv;
        postDivAtual = postDivAtual.replace(':nome', postagemAtual.nome);
        postDivAtual = postDivAtual.replace(':usuario', postagemAtual.usuario);
        postDivAtual = postDivAtual.replace(':cargo', postagemAtual.cargo);
        postDivAtual = postDivAtual.replace(':classificacoes', classificacoesString);

        feedHeader.innerHTML += postDivAtual;
    }
}

gerarPosts();

const checklistClassificacoes = $id('checklist_classificacoes');
const checklistClassDiv = `
            <div id="checklist_classificacoes">
                <input type="checkbox" id="class_check_:indice" class="class_check">
                :nome
            </div>`

function gerarChecklistClass() {
    checklistClassificacoes.innerHTML = '';

    let checklistDivAtual = '';
    for (let i = 0; i < classificacoes.length; i++) {
        let classDivAtual = checklistClassDiv;
        classDivAtual = classDivAtual.replace(':nome', classificacoes[i]);
        classDivAtual = classDivAtual.replace(':indice', i);
        checklistDivAtual += classDivAtual;
    }
    checklistClassificacoes.innerHTML = checklistDivAtual;
    for (let i = 0; i < classificacoes.length; i++) {
        $id('class_check_'+i).addEventListener('click', () => {
            gerarPosts();
        });
    }
}

gerarChecklistClass();