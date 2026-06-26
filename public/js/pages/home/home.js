import { renderizar_barra_lateral } from '/js/pages/home/components/sidebar.js';
import { renderizar_cabecalho } from '/js/components/header.js';
import { criar_post } from '/js/pages/home/components/post.js';
import { criar_filtro, carregar_feed_filtro } from '/js/pages/home/components/filtro.js';
import { api_fetch, extrair_mensagem, extrair_lista, normalizar_post, normalizar_categoria } from "/js/app/api.js";

let feed_ativo_id = null;
let pesquisar_handler = null;
let categorias_handler = null;
let cursos_handler = null;

export async function load_home_page(param){
    try {
        await renderizar_barra_lateral()
    } catch (erro) {
        console.warn("Não foi possível carregar a barra lateral:", erro.message);
    }

    renderizar_cabecalho()
    criar_filtro()
    trocar_barra_lateral();
    configurar_botao_adicionar_feed();

    try {
        const feeds = await carregar_feed_header();
        if (feeds.length > 0) {
            const feed_inicial = feeds.find(feed => feed.ultimo_feed_ativo) ?? feeds[0];
            await selecionar_feed(feed_inicial);
        } else {
            await carregar_conteudo(null);
        }
    } catch (erro) {
        mostrar_erro_feed(`Erro ao carregar os feeds: ${erro.message}`);
    }

    if (pesquisar_handler) window.removeEventListener("knowledgehub:pesquisar", pesquisar_handler);
    pesquisar_handler = async (evento) => {
        await carregar_conteudo(feed_ativo_id, evento.detail?.pesquisa ?? "");
    };
    window.addEventListener("knowledgehub:pesquisar", pesquisar_handler);

    if (categorias_handler) window.removeEventListener("knowledgehub:feedCategoriasAtualizadas", categorias_handler);
    categorias_handler = async (evento) => {
        const feed_id = evento.detail?.feed_id ?? feed_ativo_id;
        const feeds = await carregar_feed_header();
        const feed_atualizado = feeds.find(feed => Number(feed.id) === Number(feed_id));
        if (feed_atualizado) {
            await selecionar_feed(feed_atualizado);
        } else if (feeds.length > 0) {
            await selecionar_feed(feeds.find(feed => feed.ultimo_feed_ativo) ?? feeds[0]);
        } else {
            feed_ativo_id = null;
            carregar_feed_filtro({ titulo: 'Sem feed', descricao: 'Crie um feed para começar.', categorias: [] });
            await carregar_conteudo(null);
        }
        await atualizar_barra_lateral();
    };
    window.addEventListener("knowledgehub:feedCategoriasAtualizadas", categorias_handler);

    if (cursos_handler) window.removeEventListener("knowledgehub:cursosAtualizados", cursos_handler);
    cursos_handler = async () => {
        await atualizar_barra_lateral();
    };
    window.addEventListener("knowledgehub:cursosAtualizados", cursos_handler);
}

function trocar_barra_lateral(){
    const botao_menu = document.getElementById("botao_menu");
    if (!botao_menu) return;
    botao_menu.addEventListener("click", () => {
        const root = document.getElementById("root");
        root.classList.toggle("barra_lateral_fechada");
    });
}

function configurar_botao_adicionar_feed(){
    const botao = document.getElementById("botao_adicionar_feed");
    if (!botao) return;
    botao.addEventListener("click", abrir_modal_criar_feed);
}

async function selecionar_feed(feed) {
    feed_ativo_id = feed.id;

    try {
        await api_fetch(`/feed/ativo/${feed.id}`, {
            method: "PUT",
            body: { id: Number(feed.id) }
        });
        feed.ultimo_feed_ativo = true;
    } catch (erro) {
        console.warn("Não foi possível salvar o último feed ativo:", erro.message);
    }

    carregar_feed_filtro(feed);

    const header_feeds = document.getElementById("header_feed");
    header_feeds?.querySelectorAll(".item_header_feed").forEach(item => {
        item.classList.toggle("ativo", item.getAttribute("feed-id") == feed.id);
    });

    await carregar_conteudo(feed.id);
}

function mostrar_erro_feed(texto){
    const corpo = document.getElementById("corpo_feed");
    if (!corpo) return;
    corpo.innerHTML = "";
    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_feed_erro");
    mensagem.textContent = texto;
    corpo.appendChild(mensagem);
}

async function carregar_conteudo(feed_id, pesquisa = ""){
    const corpo = document.getElementById("corpo_feed")
    if (!corpo) return;
    corpo.innerHTML = "";

    if (!feed_id) {
        const mensagem = document.createElement("p");
        mensagem.classList.add("mensagem_feed_vazio");
        mensagem.textContent = "Crie um feed para começar.";
        corpo.appendChild(mensagem);
        return;
    }

    try {
        const posts = await buscar_posts(feed_id, pesquisa);
        if(posts.length === 0){
            const mensagem = document.createElement("p");
            mensagem.classList.add("mensagem_feed_vazio");
            mensagem.textContent = "Nenhum post encontrado.";
            corpo.appendChild(mensagem);
        }else{
            posts.forEach(post => {
                const post_elemento = criar_post(post)
                corpo.appendChild(post_elemento)
            })
        }
    } catch (erro) {
        const mensagem = document.createElement("p");
        mensagem.classList.add("mensagem_feed_erro");
        mensagem.textContent = erro.message;
        corpo.appendChild(mensagem);
    }
}

async function buscar_posts(feed_id, pesquisa = ""){
    if (!feed_id) return [];
    const pesquisa_formatada = pesquisa.trim();
    const rota = pesquisa_formatada
        ? `/feed/${feed_id}/${encodeURIComponent(pesquisa_formatada)}`
        : `/feed/${feed_id}`;
    const dados = await api_fetch(rota);
    return extrair_lista(dados, ["posts"]).map(normalizar_post);
} 

async function carregar_feed_header(){
    const feeds = await carregar_feeds()
    const header_feeds = document.getElementById("header_feed")
    if (!header_feeds) return feeds;

    header_feeds.querySelectorAll(".item_header_feed").forEach(item => item.remove());

    feeds.forEach(feed => {
        const item_header_feed = document.createElement("button")
        item_header_feed.classList.add("item_header_feed")
        item_header_feed.innerText = feed.titulo
        item_header_feed.setAttribute("feed-id",feed.id)
        item_header_feed.setAttribute("type","button")
        header_feeds.appendChild(item_header_feed)
        item_header_feed.addEventListener("click",() => selecionar_feed(feed))
    });

    return feeds;
}

async function carregar_feeds(){
    const dados = await api_fetch("/feed")
    return extrair_lista(dados, ["feeds"]).map(feed => {
        const categorias = Array.isArray(feed.categorias ?? feed.generos) ? (feed.categorias ?? feed.generos) : [];
        return {
            ...feed,
            categorias,
            generos: categorias,
            id: Number(feed.id),
            ultimo_feed_ativo: Boolean(feed.ultimo_feed_ativo),
            sem_filtro: categorias.length === 0
        };
    });
}

async function abrir_modal_criar_feed(){
    fechar_modal_criar_feed();

    const categorias = await buscar_categorias();
    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay");
    overlay.setAttribute("id", "modal_feed_overlay");

    const modal = document.createElement("section");
    modal.classList.add("modal_feed");

    const titulo = document.createElement("h2");
    titulo.innerText = "Criar novo feed";

    const form = document.createElement("form");
    form.classList.add("form_criar_feed");

    const label_titulo = document.createElement("label");
    label_titulo.innerText = "Título do feed *";

    const input_titulo = document.createElement("input");
    input_titulo.name = "titulo";
    input_titulo.required = true;
    input_titulo.maxLength = 200;
    input_titulo.placeholder = "Ex: Programação Web";

    const label_descricao = document.createElement("label");
    label_descricao.innerText = "Descrição";

    const textarea_descricao = document.createElement("textarea");
    textarea_descricao.name = "descricao";
    textarea_descricao.rows = 3;
    textarea_descricao.placeholder = "Ex: posts sobre PHP, JS e banco de dados";

    const titulo_categorias = document.createElement("p");
    titulo_categorias.classList.add("titulo_categorias_feed");
    titulo_categorias.innerText = "Categorias (opcional)";

    const dica_sem_filtro = document.createElement("p");
    dica_sem_filtro.classList.add("dica_feed_sem_filtro");
    dica_sem_filtro.innerText = "Deixe sem categoria para criar um feed sem filtro, mostrando todos os posts.";

    const lista_categorias = document.createElement("div");
    lista_categorias.classList.add("lista_categorias_feed");

    categorias.forEach(categoria => {
        const item = document.createElement("label");
        item.classList.add("checkbox_categoria_feed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "categorias";
        checkbox.value = categoria.id;

        const texto = document.createElement("span");
        texto.innerText = categoria.nome;

        item.appendChild(checkbox);
        item.appendChild(texto);
        lista_categorias.appendChild(item);
    });

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");

    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.classList.add("botao_cancelar_feed");
    cancelar.innerText = "Cancelar";
    cancelar.addEventListener("click", fechar_modal_criar_feed);

    const salvar = document.createElement("button");
    salvar.type = "submit";
    salvar.classList.add("botao_salvar_feed");
    salvar.innerText = "Criar feed";

    acoes.appendChild(cancelar);
    acoes.appendChild(salvar);

    form.appendChild(label_titulo);
    form.appendChild(input_titulo);
    form.appendChild(label_descricao);
    form.appendChild(textarea_descricao);
    form.appendChild(titulo_categorias);
    form.appendChild(dica_sem_filtro);
    form.appendChild(lista_categorias);
    form.appendChild(mensagem);
    form.appendChild(acoes);

    modal.appendChild(titulo);
    modal.appendChild(form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    input_titulo.focus();

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) fechar_modal_criar_feed();
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagem.innerText = "";

        const categorias_marcadas = [...form.querySelectorAll('input[name="categorias"]:checked')]
            .map(input => Number(input.value));

        salvar.disabled = true;
        salvar.innerText = "Criando...";

        try {
            const dados = await api_fetch("/feed/add", {
                method: "POST",
                body: {
                    titulo: input_titulo.value.trim(),
                    descricao: textarea_descricao.value.trim(),
                    categorias: categorias_marcadas,
                    ultimo_feed_ativo: true
                }
            });

            const novo_feed = extrair_mensagem(dados);
            const feeds = await carregar_feed_header();
            const feed_criado = feeds.find(feed => Number(feed.id) === Number(novo_feed.id)) ?? novo_feed;
            fechar_modal_criar_feed();
            await selecionar_feed(feed_criado);
            await atualizar_barra_lateral();
        } catch (erro) {
            mensagem.innerText = erro.message;
            salvar.disabled = false;
            salvar.innerText = "Criar feed";
        }
    });
}

function fechar_modal_criar_feed(){
    document.getElementById("modal_feed_overlay")?.remove();
}

async function buscar_categorias(){
    const dados = await api_fetch("/categoria");
    return extrair_lista(dados, ["categorias", "generos"]).map(normalizar_categoria);
}

async function atualizar_barra_lateral(){
    document.getElementById("barra_lateral")?.remove();
    try {
        await renderizar_barra_lateral();
        trocar_barra_lateral();
    } catch (erro) {
        console.warn("Não foi possível atualizar a barra lateral:", erro.message);
    }
}

export function formatar_url(url_normal){
    return url_normal.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s/g, "_")
        .replace(/\//g, "-")
}
 
