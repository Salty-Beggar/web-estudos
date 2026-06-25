const body = document.getElementsByTagName('body')[0];

body.addEventListener('keydown', (e) => {
    console.log(e.key);
    if (e.key === 'Escape') carregarPagina(0, paginaFeed);
});

const paginaFeed = 0;
const paginaQuestao = 1;
const paginaProva = 2;

const paginas = [
    document.getElementsByClassName('pagina0')
];

function iniciarPaginas(pagIndex) {
    for (let index = 0; index < paginas[pagIndex].length; index++) {
        const element = paginas[pagIndex][index];
        element.style.display = 'none';
    }
}

let ultimaPagina = -1;
function carregarPagina(pagIndex, indice) {
    if (ultimaPagina != -1) paginas[pagIndex][ultimaPagina].style.display = 'none';
    paginas[pagIndex][indice].style.display = 'block';
    if (pagIndex == 0 && indice == paginaFeed) paginas[pagIndex][indice].style.display = 'grid';
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
        tipo: 'Prova',
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
        ],
        voto: 0
    },
    {
        nome: 'Maus: Desenhos fofos com história trágica',
        tipo: 'Artigo',
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
        ],
        voto: 0
    },
    {
        nome: 'França: Tomada da bastilha',
        tipo: 'Artigo',
        usuario: 'Luiza Carla',
        cargo: 'Hobbyista',
        classificacoes: [
            {
                class: 0,
                rating: 800,
                votos: 3
            }
        ],
        voto: 0
    },
    {
        nome: 'Guerra Mundial',
        tipo: 'Vídeo',
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
        ],
        voto: 0
    },
    {
        nome: 'Como escrever redações: inicio',
        tipo: 'Artigo',
        usuario: 'Lucas Andrade da Silva',
        cargo: 'Professor',
        classificacoes: [
            {
                class: 4,
                rating: 300,
                votos: 5
            }
        ],
        voto: 0
    },
    {
        nome: 'Gente oq é uma celula????',
        tipo: 'Post Social',
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
        ],
        voto: 0
    },
    {
        nome: 'Questão ENEM Invertebrados',
        tipo: 'Questão',
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
        ],
        voto: 0
    }
]

for (let i = 0; i < postagens.length; i++) {
    for (let j = 0; j < postagens[i].classificacoes.length; j++) {
        postagens[i].classificacoes[j].votoUser = 0;
        postagens[i].classificacoes[j].salvo = false;
    }
}

const postDiv = `<div id="feed-container-main">
                    <div id="feed-container" data-owner=Mito"feed-container">
                        <section class="feed-container-data">
                            <h2 class="container-tittle" id="title_:indice">:nome</h2><button id='salvar_post_:indice' class=':salvar_selecionado'>Salvar</button><br>
                            <p class="container-type-user">Tipo: :tipo</p></br>
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
                                Votos: :votos <button class='voto_mais_:indice_:class :mais_selecionado'>+</button><button class='voto_menos_:indice_:class :menos_selecionado'>-</button>
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
                        aValue *= element.votos + element.votoUser*3;
                    }
                });
            }
        }
        let bValue = 1;
        for (let i = 0; i < document.getElementsByClassName('class_check').length; i++) {
            if ($id('class_check_'+i).checked) {
                b.classificacoes.forEach(element => {
                    if (element.class == i) bValue *= element.votos + element.votoUser*3;
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
            strAtual = strAtual.replace(':votos', classificacaoAtual.votos + classificacaoAtual.votoUser*3);
            strAtual = strAtual.replaceAll(':indice', i);
            strAtual = strAtual.replaceAll(':class', classificacaoAtual.class);
            if (classificacaoAtual.votoUser == 1) strAtual = strAtual.replace(':mais_selecionado', 'selecionado');
            else if (classificacaoAtual.votoUser == -1) strAtual = strAtual.replace(':menos_selecionado', 'selecionado');
            classificacoesString += strAtual;
        }

        let postDivAtual = postDiv;
        postDivAtual = postDivAtual.replace(':nome', postagemAtual.nome);
        postDivAtual = postDivAtual.replace(':tipo', postagemAtual.tipo);
        postDivAtual = postDivAtual.replace(':usuario', postagemAtual.usuario);
        postDivAtual = postDivAtual.replace(':cargo', postagemAtual.cargo);
        postDivAtual = postDivAtual.replaceAll(':indice', i);
        if (postagemAtual.salvo) postDivAtual = postDivAtual.replace(':salvar_selecionado', 'selecionado');
        postDivAtual = postDivAtual.replace(':classificacoes', classificacoesString);

        feedHeader.innerHTML += postDivAtual;
    }

    for (let i = 0; i < postagens.length; i++) {
        const postagemAtual = postagens[i];
        const classificacoesPostagem = postagemAtual.classificacoes;

        for (let j = 0; j < classificacoesPostagem.length; j++) {
            const classificacaoAtual = classificacoesPostagem[j];

            const classificacaoVotoMaisClass = 'voto_mais_'+i+'_'+classificacaoAtual.class;
            const classificacaoVotoMenosClass = 'voto_menos_'+i+'_'+classificacaoAtual.class;

            const votoMaisDiv = document.getElementsByClassName(classificacaoVotoMaisClass)[0];
            const votoMenosDiv = document.getElementsByClassName(classificacaoVotoMenosClass)[0];

            votoMaisDiv.addEventListener('click', function() {
                if (classificacaoAtual.votoUser != 1) classificacaoAtual.votoUser = 1;
                else classificacaoAtual.votoUser = 0;
                gerarPosts();
            });
            votoMenosDiv.addEventListener('click', function() {
                if (classificacaoAtual.votoUser != -1) classificacaoAtual.votoUser = -1;
                else classificacaoAtual.votoUser = 0;
                gerarPosts();
            });
        }

        const botaoSalvar = $id('salvar_post_'+i);
        botaoSalvar.addEventListener('click', function() {
            if (!postagemAtual.salvo) {
                postagemAtual.salvo = true;
                postsSalvos.push(i);
            }else {
                postagemAtual.salvo = false;
                postsSalvos.splice(postsSalvos.indexOf(i), 1);
            }
            gerarSalvos();
            gerarPosts();
        });
        const botaoTitulo = $id('title_'+i);
        botaoTitulo.addEventListener('click', function() {
            const tipoAtual = postagemAtual.tipo;
            switch (tipoAtual) {
                case 'Questão':
                    carregarPagina(0, paginaQuestao);
                    break;
                case 'Prova':
                    carregarPagina(0, paginaProva);
            }
        })
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

const divSalvos = $id('tab_salvos');
const divPostSalvo = `<div style="margin-top: 10px; margin-bottom: 20px">
                    <h3>:titulo</h3>
                    <i>:tipo</i><br>
                    <i>Classificações</i>
                    <ul>
                        :classificacoes
                    </ul>
                </div>`

postsSalvos = [];

function gerarSalvos() {
    divSalvos.innerHTML = '';
    for (let i = 0; i < postsSalvos.length; i++) {
        const postagemAtual = postagens[postsSalvos[i]];
        let strAtual = divPostSalvo;
        let strClassificacoes = '';
        for (let j = 0; j < postagemAtual.classificacoes.length; j++) {
            strClassificacoes += '<li>'+classificacoes[postagemAtual.classificacoes[j].class]+'</li>'
        }
        strAtual = strAtual.replace(':titulo', postagemAtual.nome);
        strAtual = strAtual.replace(':tipo', postagemAtual.tipo);
        strAtual = strAtual.replace(':classificacoes', strClassificacoes);
        divSalvos.innerHTML += strAtual;
    }
}

gerarSalvos();