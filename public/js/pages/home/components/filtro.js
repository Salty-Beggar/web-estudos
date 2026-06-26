import { formatar_url } from "/js/pages/home/home.js";
import { routes } from "/js/app/router.js";
import { api_fetch, extrair_mensagem, extrair_lista, normalizar_categoria } from "/js/app/api.js";

let feed_atual = null;
let modo_retirar = false;
let categorias_marcadas_para_retirar = new Set();

export function criar_filtro(){
    const root = document.getElementById("root");
    const filtro_container = document.createElement("section");
    filtro_container.setAttribute("id","filtro_container");
    root.appendChild(filtro_container);

    const titulo = document.createElement("h2");
    titulo.setAttribute("id","feed_titulo");
    filtro_container.appendChild(titulo);

    const descricao = document.createElement("p");
    descricao.setAttribute("id","feed_descricao");
    filtro_container.appendChild(descricao);
}

export function carregar_feed_filtro(feed){
    feed_atual = feed;
    modo_retirar = false;
    categorias_marcadas_para_retirar = new Set();

    const section_generos_antiga = document.getElementById("section_generos");
    if(section_generos_antiga) section_generos_antiga.remove();

    const filtro_container = document.getElementById("filtro_container");
    if (!filtro_container) return;

    const section_generos = document.createElement("section");
    section_generos.setAttribute("id","section_generos");
    filtro_container.appendChild(section_generos);

    const descricao = document.getElementById("feed_descricao");
    const titulo = document.getElementById('feed_titulo');

    titulo.innerText = feed.titulo ?? "Feed";
    descricao.innerText = feed.descricao ?? "";

    const painel_feed = document.createElement("div");
    painel_feed.classList.add("painel_acoes_feed");

    const botao_editar_feed = document.createElement("button");
    botao_editar_feed.type = "button";
    botao_editar_feed.classList.add("botao_editar_feed");
    botao_editar_feed.innerText = "Atualizar feed";
    botao_editar_feed.addEventListener("click", abrir_modal_atualizar_feed);

    const botao_deletar_feed = document.createElement("button");
    botao_deletar_feed.type = "button";
    botao_deletar_feed.classList.add("botao_deletar_feed");
    botao_deletar_feed.innerText = "Deletar feed";
    botao_deletar_feed.addEventListener("click", abrir_modal_deletar_feed);

    painel_feed.appendChild(botao_editar_feed);
    painel_feed.appendChild(botao_deletar_feed);
    section_generos.appendChild(painel_feed);

    const cabecalho_categorias = document.createElement("div");
    cabecalho_categorias.classList.add("cabecalho_categorias_feed");

    const titulo_categorias = document.createElement("h3");
    titulo_categorias.innerText = "Categorias do feed";

    const acoes_categorias = document.createElement("div");
    acoes_categorias.classList.add("acoes_categorias_feed");

    const botao_adicionar = document.createElement("button");
    botao_adicionar.type = "button";
    botao_adicionar.classList.add("botao_adicionar_categoria_feed");
    botao_adicionar.innerText = "+ Categoria";
    botao_adicionar.addEventListener("click", abrir_modal_adicionar_categoria);

    const botao_retirar = document.createElement("button");
    botao_retirar.type = "button";
    botao_retirar.classList.add("botao_retirar_categoria_feed");
    botao_retirar.innerText = "Retirar";

    acoes_categorias.appendChild(botao_adicionar);
    acoes_categorias.appendChild(botao_retirar);
    cabecalho_categorias.appendChild(titulo_categorias);
    cabecalho_categorias.appendChild(acoes_categorias);
    section_generos.appendChild(cabecalho_categorias);

    const painel_retirada = document.createElement("div");
    painel_retirada.classList.add("painel_retirar_categorias");
    painel_retirada.hidden = true;

    const texto_painel = document.createElement("p");
    texto_painel.innerText = "Clique nas categorias que quer retirar e confirme.";

    const acoes_retirada = document.createElement("div");
    acoes_retirada.classList.add("acoes_retirar_categorias");

    const botao_cancelar = document.createElement("button");
    botao_cancelar.type = "button";
    botao_cancelar.classList.add("botao_cancelar_retirada");
    botao_cancelar.innerText = "Cancelar";

    const botao_confirmar = document.createElement("button");
    botao_confirmar.type = "button";
    botao_confirmar.classList.add("botao_confirmar_retirada");
    botao_confirmar.innerText = "Confirmar retirada";
    botao_confirmar.disabled = true;

    acoes_retirada.appendChild(botao_cancelar);
    acoes_retirada.appendChild(botao_confirmar);
    painel_retirada.appendChild(texto_painel);
    painel_retirada.appendChild(acoes_retirada);
    section_generos.appendChild(painel_retirada);

    const lista = document.createElement("div");
    lista.classList.add("lista_categorias_ativas_feed");
    section_generos.appendChild(lista);

    botao_retirar.addEventListener("click", () => ativar_modo_retirar({ lista, painel_retirada, botao_retirar, botao_adicionar, botao_confirmar }));
    botao_cancelar.addEventListener("click", () => desativar_modo_retirar({ lista, painel_retirada, botao_retirar, botao_adicionar, botao_confirmar }));
    botao_confirmar.addEventListener("click", () => confirmar_retirada_categorias(botao_confirmar));

    const categorias = Array.isArray(feed.categorias ?? feed.generos) ? (feed.categorias ?? feed.generos) : [];
    if (categorias.length === 0) {
        botao_retirar.disabled = true;
        const vazio = document.createElement("p");
        vazio.classList.add("mensagem_categoria_vazia");
        vazio.innerText = "Feed sem filtro: ele mostra todos os posts.";
        lista.appendChild(vazio);
        return;
    }

    categorias.forEach(categoria => {
        const categoria_normalizada = normalizar_categoria(categoria);
        const item = document.createElement("div");
        item.classList.add("categoria_feed_item");
        item.dataset.categoriaId = categoria_normalizada.id;

        const button = document.createElement("button");
        button.classList.add("botao_categoria_feed");
        button.innerText = categoria_normalizada.nome;
        button.setAttribute("type", "button");
        button.addEventListener('click', async () => {
            if (modo_retirar) {
                alternar_categoria_para_retirar(categoria_normalizada.id, item, botao_confirmar);
                return;
            }
            const genero_formatado = formatar_url(categoria_normalizada.nome);
            history.pushState(null,null,`/Generos/${genero_formatado}`);
            await routes.executar();
        });

        item.appendChild(button);
        lista.appendChild(item);
    });
}

function ativar_modo_retirar({ lista, painel_retirada, botao_retirar, botao_adicionar, botao_confirmar }){
    const categorias = Array.isArray(feed_atual?.categorias ?? feed_atual?.generos) ? (feed_atual?.categorias ?? feed_atual?.generos) : [];
    if (categorias.length === 0) return;

    modo_retirar = true;
    categorias_marcadas_para_retirar = new Set();
    lista.classList.add("modo_retirar");
    painel_retirada.hidden = false;
    botao_retirar.classList.add("ativo_retirar");
    botao_retirar.disabled = true;
    botao_adicionar.disabled = true;
    botao_confirmar.disabled = true;
}

function desativar_modo_retirar({ lista, painel_retirada, botao_retirar, botao_adicionar, botao_confirmar }){
    modo_retirar = false;
    categorias_marcadas_para_retirar = new Set();
    lista.classList.remove("modo_retirar");
    painel_retirada.hidden = true;
    botao_retirar.classList.remove("ativo_retirar");
    botao_retirar.disabled = false;
    botao_adicionar.disabled = false;
    botao_confirmar.disabled = true;
    lista.querySelectorAll(".categoria_feed_item").forEach(item => item.classList.remove("selecionada_para_remover"));
}

function alternar_categoria_para_retirar(categoria_id, item, botao_confirmar){
    const id = Number(categoria_id);
    if (categorias_marcadas_para_retirar.has(id)) {
        categorias_marcadas_para_retirar.delete(id);
        item.classList.remove("selecionada_para_remover");
    } else {
        categorias_marcadas_para_retirar.add(id);
        item.classList.add("selecionada_para_remover");
    }

    botao_confirmar.disabled = categorias_marcadas_para_retirar.size === 0;
}

function abrir_modal_atualizar_feed(){
    if (!feed_atual?.id) return;
    fechar_modal_feed_acao();

    const overlay = criar_overlay_modal("modal_feed_acao_overlay");
    const modal = criar_modal_base("Atualizar feed");
    const form = document.createElement("form");
    form.classList.add("form_criar_feed");

    const labelTitulo = document.createElement("label");
    labelTitulo.innerText = "Título do feed *";
    const inputTitulo = document.createElement("input");
    inputTitulo.type = "text";
    inputTitulo.maxLength = 200;
    inputTitulo.required = true;
    inputTitulo.value = feed_atual.titulo ?? "";

    const labelDescricao = document.createElement("label");
    labelDescricao.innerText = "Descrição";
    const textareaDescricao = document.createElement("textarea");
    textareaDescricao.rows = 4;
    textareaDescricao.value = feed_atual.descricao ?? "";

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.classList.add("botao_cancelar_feed");
    cancelar.innerText = "Cancelar";
    cancelar.addEventListener("click", fechar_modal_feed_acao);
    const salvar = document.createElement("button");
    salvar.type = "submit";
    salvar.classList.add("botao_salvar_feed");
    salvar.innerText = "Salvar alterações";

    acoes.appendChild(cancelar);
    acoes.appendChild(salvar);
    form.append(labelTitulo, inputTitulo, labelDescricao, textareaDescricao, mensagem, acoes);
    modal.appendChild(form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    inputTitulo.focus();

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) fechar_modal_feed_acao();
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagem.innerText = "";
        salvar.disabled = true;
        salvar.innerText = "Salvando...";
        try {
            await api_fetch("/feed/update", {
                method: "PUT",
                body: {
                    id: Number(feed_atual.id),
                    titulo: inputTitulo.value.trim(),
                    descricao: textareaDescricao.value.trim()
                }
            });
            fechar_modal_feed_acao();
            emitir_feeds_alterados(feed_atual.id);
        } catch (erro) {
            mensagem.innerText = erro.message;
            salvar.disabled = false;
            salvar.innerText = "Salvar alterações";
        }
    });
}

function abrir_modal_deletar_feed(){
    if (!feed_atual?.id) return;
    fechar_modal_feed_acao();

    const overlay = criar_overlay_modal("modal_feed_acao_overlay");
    const modal = criar_modal_base("Deletar feed");
    modal.classList.add("modal_confirmar_delete_feed");

    const aviso = document.createElement("p");
    aviso.classList.add("texto_modal_categoria_feed");
    aviso.innerText = `Tem certeza que deseja deletar o feed "${feed_atual.titulo ?? 'Feed'}"? Os posts não serão apagados, só o feed.`;

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.classList.add("botao_cancelar_feed");
    cancelar.innerText = "Cancelar";
    cancelar.addEventListener("click", fechar_modal_feed_acao);
    const deletar = document.createElement("button");
    deletar.type = "button";
    deletar.classList.add("botao_deletar_confirmado");
    deletar.innerText = "Sim, deletar";

    acoes.appendChild(cancelar);
    acoes.appendChild(deletar);
    modal.append(aviso, mensagem, acoes);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) fechar_modal_feed_acao();
    });

    deletar.addEventListener("click", async () => {
        mensagem.innerText = "";
        deletar.disabled = true;
        deletar.innerText = "Deletando...";
        try {
            await api_fetch(`/feed/delete/${feed_atual.id}`, { method: "DELETE" });
            fechar_modal_feed_acao();
            emitir_feeds_alterados(null, true);
        } catch (erro) {
            mensagem.innerText = erro.message;
            deletar.disabled = false;
            deletar.innerText = "Sim, deletar";
        }
    });
}

async function abrir_modal_adicionar_categoria(){
    if (!feed_atual?.id) return;
    fechar_modal_categoria_feed();

    const categorias = await buscar_categorias();
    const categorias_ativas = Array.isArray(feed_atual.categorias ?? feed_atual.generos) ? (feed_atual.categorias ?? feed_atual.generos) : [];
    const categorias_atuais = new Set(categorias_ativas.map(categoria => Number(categoria.id)));
    const categorias_disponiveis = categorias.filter(categoria => !categorias_atuais.has(Number(categoria.id)));

    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay");
    overlay.id = "modal_categoria_feed_overlay";

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_categoria_feed");

    const titulo = document.createElement("h2");
    titulo.innerText = "Adicionar categoria ao feed";

    const texto = document.createElement("p");
    texto.classList.add("texto_modal_categoria_feed");
    texto.innerText = "Escolha uma categoria existente ou crie uma nova.";

    const form_criar = document.createElement("form");
    form_criar.classList.add("form_criar_categoria_feed");

    const input_nova = document.createElement("input");
    input_nova.type = "text";
    input_nova.maxLength = 200;
    input_nova.placeholder = "Nova categoria, ex: Biologia Molecular";

    const botao_criar = document.createElement("button");
    botao_criar.type = "submit";
    botao_criar.innerText = "Criar e adicionar";

    form_criar.appendChild(input_nova);
    form_criar.appendChild(botao_criar);

    const lista = document.createElement("div");
    lista.classList.add("lista_adicionar_categoria_feed");

    if (categorias_disponiveis.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("mensagem_categoria_vazia");
        vazio.innerText = "Todas as categorias já estão nesse feed.";
        lista.appendChild(vazio);
    } else {
        categorias_disponiveis.forEach(categoria => {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.classList.add("botao_opcao_categoria_feed");
            botao.innerText = categoria.nome;
            botao.addEventListener("click", () => adicionar_categoria_ao_feed(categoria.id, botao));
            lista.appendChild(botao);
        });
    }

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.classList.add("botao_cancelar_feed");
    fechar.innerText = "Fechar";
    fechar.addEventListener("click", fechar_modal_categoria_feed);

    acoes.appendChild(fechar);
    modal.appendChild(titulo);
    modal.appendChild(texto);
    modal.appendChild(form_criar);
    modal.appendChild(lista);
    modal.appendChild(mensagem);
    modal.appendChild(acoes);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) fechar_modal_categoria_feed();
    });

    form_criar.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagem.innerText = "";
        const nome = input_nova.value.trim();
        if (!nome) {
            mensagem.innerText = "Digite o nome da categoria.";
            return;
        }

        botao_criar.disabled = true;
        botao_criar.innerText = "Salvando...";

        try {
            const dados = await api_fetch("/categoria/add", {
                method: "POST",
                body: { nome }
            });
            const categoria = normalizar_categoria(extrair_mensagem(dados));
            await adicionar_categoria_ao_feed(categoria.id, botao_criar);
        } catch (erro) {
            mensagem.innerText = erro.message;
            botao_criar.disabled = false;
            botao_criar.innerText = "Criar e adicionar";
        }
    });
}

function criar_overlay_modal(id){
    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay");
    overlay.id = id;
    return overlay;
}

function criar_modal_base(tituloTexto){
    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_feed_acao");
    const titulo = document.createElement("h2");
    titulo.innerText = tituloTexto;
    modal.appendChild(titulo);
    return modal;
}

function fechar_modal_feed_acao(){
    document.getElementById("modal_feed_acao_overlay")?.remove();
}

function fechar_modal_categoria_feed(){
    document.getElementById("modal_categoria_feed_overlay")?.remove();
}

async function buscar_categorias(){
    const dados = await api_fetch("/categoria");
    return extrair_lista(dados, ["categorias", "generos"]).map(normalizar_categoria);
}

async function adicionar_categoria_ao_feed(categoria_id, botao){
    if (!feed_atual?.id || !categoria_id) return;
    if (botao) botao.disabled = true;

    try {
        await api_fetch(`/feed/categoria/add/${feed_atual.id}/${categoria_id}`, {
            method: "PUT",
            body: {}
        });
        fechar_modal_categoria_feed();
        emitir_feeds_alterados(feed_atual.id);
    } catch (erro) {
        alert(erro.message);
        if (botao) botao.disabled = false;
    }
}

async function confirmar_retirada_categorias(botao_confirmar){
    if (!feed_atual?.id || categorias_marcadas_para_retirar.size === 0) return;

    // Pode remover todas as categorias: feed sem categorias é feed sem filtro.
    // Nesse caso o backend carrega todos os posts publicados.
    botao_confirmar.disabled = true;
    botao_confirmar.innerText = "Retirando...";

    try {
        for (const categoria_id of categorias_marcadas_para_retirar) {
            await api_fetch(`/feed/categoria/delete/${feed_atual.id}/${categoria_id}`, {
                method: "DELETE"
            });
        }
        emitir_feeds_alterados(feed_atual.id);
    } catch (erro) {
        alert(erro.message);
        botao_confirmar.disabled = false;
        botao_confirmar.innerText = "Confirmar retirada";
    }
}

function emitir_feeds_alterados(feed_id = feed_atual?.id, deletado = false){
    window.dispatchEvent(new CustomEvent("knowledgehub:feedCategoriasAtualizadas", {
        detail: { feed_id, deletado }
    }));
}
