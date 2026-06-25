import { api_fetch, extrair_mensagem, normalizar_post } from "/js/app/api.js";

export async function load_post_page(param) {
    const id = param[1]; 
    const dados_post = await buscar_dados_post(id);

    const root = document.getElementById("root");
    root.appendChild(criar_post_base(dados_post))

    if(dados_post.tipo == "artigo"){
        inserir_informacoes_artigo(dados_post, dados_post.corpo ?? "")
    } else if (dados_post.tipo == "atividade") {
        inserir_informacoes_atividade(dados_post)
    } else if (dados_post.tipo == "curso") {
        inserir_informacoes_curso(dados_post)
    }
}

async function buscar_dados_post(id_post){
    const dados = await api_fetch(`/posts/${id_post}`);
    return normalizar_post(extrair_mensagem(dados));
}

function inserir_informacoes_artigo(dados_post, texto){
    const corpo_material = document.querySelector(".material_post")
    corpo_material.innerHTML = "";

    const artigo = document.createElement("article");
    artigo.classList.add("corpo_markdown");
    artigo.innerHTML = renderizar_markdown(texto || "Sem conteúdo.");
    corpo_material.appendChild(artigo);
}

function inserir_informacoes_atividade(dados_post){
    const corpo_material = document.querySelector(".material_post")
    corpo_material.innerHTML = "";

    const atividade = document.createElement("section");
    atividade.classList.add("atividade_container");

    const titulo_bloco = document.createElement("div");
    titulo_bloco.classList.add("atividade_topo");

    const etiqueta = document.createElement("p");
    etiqueta.classList.add("atividade_etiqueta");
    etiqueta.innerText = "Atividade de alternativa";

    const instrucoes = document.createElement("article");
    instrucoes.classList.add("atividade_texto", "corpo_markdown");
    instrucoes.innerHTML = renderizar_markdown(dados_post.texto_atividade || "Leia a questão e selecione uma alternativa.");

    const questao = document.createElement("div");
    questao.classList.add("atividade_questao");

    const titulo_questao = document.createElement("h2");
    titulo_questao.innerText = "Questão";

    const enunciado = document.createElement("p");
    enunciado.classList.add("atividade_enunciado");
    enunciado.innerText = dados_post.enunciado || "Sem enunciado.";

    const lista_opcoes = document.createElement("div");
    lista_opcoes.classList.add("opcoes_atividade");

    const feedback = document.createElement("p");
    feedback.classList.add("feedback_atividade");
    feedback.setAttribute("aria-live", "polite");

    const botao_confirmar = document.createElement("button");
    botao_confirmar.type = "button";
    botao_confirmar.classList.add("botao_confirmar_atividade");
    botao_confirmar.innerText = "Confirmar resposta";

    const opcoes = [...(dados_post.opcoes ?? [])].sort((a, b) => Number(a.ordem) - Number(b.ordem));
    let opcao_selecionada = null;
    let respondida = false;
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (opcoes.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("atividade_sem_opcoes");
        vazio.innerText = "Essa atividade ainda não tem alternativas cadastradas.";
        lista_opcoes.appendChild(vazio);
        botao_confirmar.disabled = true;
    }

    opcoes.forEach((opcao, index) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("opcao_atividade");
        botao.dataset.ordem = opcao.ordem;

        const letra = document.createElement("span");
        letra.classList.add("opcao_letra");
        letra.innerText = letras[index] ?? `${index + 1}`;

        const texto = document.createElement("span");
        texto.classList.add("opcao_texto");
        texto.innerText = opcao.texto ?? "Alternativa sem texto";

        botao.appendChild(letra);
        botao.appendChild(texto);
        lista_opcoes.appendChild(botao);

        botao.addEventListener("click", () => {
            opcao_selecionada = Number(botao.dataset.ordem);
            respondida = false;
            feedback.innerText = "";
            feedback.className = "feedback_atividade";
            lista_opcoes.querySelectorAll(".opcao_atividade").forEach(item => {
                item.classList.remove("opcao_atividade_selecionada", "opcao_atividade_correta", "opcao_atividade_errada");
            });
            botao.classList.add("opcao_atividade_selecionada");
        });
    });

    botao_confirmar.addEventListener("click", () => {
        if (!opcao_selecionada) {
            feedback.classList.add("feedback_atividade_alerta");
            feedback.innerText = "Selecione uma alternativa antes de confirmar.";
            return;
        }

        const resposta_certa = Number(dados_post.resposta_certa);
        const acertou = opcao_selecionada === resposta_certa;
        respondida = true;

        lista_opcoes.querySelectorAll(".opcao_atividade").forEach(item => {
            const ordem = Number(item.dataset.ordem);
            item.classList.toggle("opcao_atividade_correta", ordem === resposta_certa);
            item.classList.toggle("opcao_atividade_errada", ordem === opcao_selecionada && !acertou);
        });

        feedback.className = "feedback_atividade";
        feedback.classList.add(acertou ? "feedback_atividade_correto" : "feedback_atividade_errado");
        const explicacao = dados_post.explicacao_atividade ? ` ${dados_post.explicacao_atividade}` : "";
        feedback.innerText = acertou ? `Resposta correta.${explicacao}` : `Resposta incorreta.${explicacao}`;
    });

    titulo_bloco.appendChild(etiqueta);
    questao.appendChild(titulo_questao);
    questao.appendChild(enunciado);
    atividade.appendChild(titulo_bloco);
    atividade.appendChild(instrucoes);
    atividade.appendChild(questao);
    atividade.appendChild(lista_opcoes);
    atividade.appendChild(botao_confirmar);
    atividade.appendChild(feedback);
    corpo_material.appendChild(atividade);
}

function inserir_informacoes_texto(texto){
    const corpo_material = document.querySelector(".material_post")
    corpo_material.innerHTML = "";

    const paragrafo = document.createElement("p");
    paragrafo.classList.add("corpo_post");
    paragrafo.innerText = texto || "Sem conteúdo.";
    corpo_material.appendChild(paragrafo);
}

function inserir_informacoes_curso(dados_post){
    const corpo_material = document.querySelector(".material_post")
    corpo_material.innerHTML = "";

    const titulo = document.createElement("h2");
    titulo.innerText = "Posts do curso";
    corpo_material.appendChild(titulo);

    const posts = dados_post.posts ?? [];
    if (posts.length === 0) {
        const vazio = document.createElement("p");
        vazio.innerText = "Esse curso ainda não tem posts.";
        corpo_material.appendChild(vazio);
        return;
    }

    posts.forEach(post => {
        const item = document.createElement("button");
        item.type = "button";
        item.innerText = post.titulo ?? `Post ${post.id}`;
        item.addEventListener("click", async () => {
            history.pushState(null, null, `/Post/${post.id}`);
            const { routes } = await import("/js/app/router.js");
            await routes.executar();
        });
        corpo_material.appendChild(item);
    });
}

function criar_post_base(dados_post){
    const post_container = document.createElement("main")
    const dados = document.createElement("div")
    const dados_do_autor = document.createElement("section")
    const dados_do_post = document.createElement("section")
    const material_post = document.createElement("section")

    dados.classList.add("dados")
    post_container.classList.add("post_container")
    dados_do_autor.classList.add("dados_autor")
    dados_do_post.classList.add("dados_post")
    material_post.classList.add("material_post")

    post_container.appendChild(dados)
    post_container.appendChild(material_post)
    dados.appendChild(dados_do_autor)
    dados.appendChild(dados_do_post)

    const nome_autor = document.createElement("p")
    const img_autor = document.createElement("img")

    dados_do_autor.appendChild(img_autor)
    dados_do_autor.appendChild(nome_autor)

    img_autor.classList.add("img_autor")
    nome_autor.classList.add("nome_autor")

    const autor = dados_post.autor ?? {};
    img_autor.src = autor.img ?? "/assets/imgs/users/guest_user.svg"
    img_autor.onerror = () => { img_autor.src = "/assets/imgs/users/guest_user.svg"; }
    nome_autor.innerText = autor.nome ?? "Usuário"

    const titulo_post = document.createElement("h1")
    const tipo_post = document.createElement("p")
    const descricao_post = document.createElement("p")
    const postado_quando_post = document.createElement("p")
    const generos_post = document.createElement("div")

    dados_do_post.appendChild(titulo_post)
    dados_do_post.appendChild(tipo_post)
    dados_do_post.appendChild(descricao_post)
    dados_do_post.appendChild(postado_quando_post)
    dados_do_post.appendChild(generos_post)

    titulo_post.classList.add("titulo_post")
    tipo_post.classList.add("tipo_post")
    descricao_post.classList.add("descricao_post")
    postado_quando_post.classList.add("postado_quando_post")
    generos_post.classList.add("generos_post")

    titulo_post.innerText = dados_post.titulo ?? "Sem título"
    tipo_post.innerText = dados_post.tipo ?? "post"
    descricao_post.innerText = dados_post.descricao ?? ""
    postado_quando_post.innerText = dados_post.data_criacao ?? ""

    const generos = Array.isArray(dados_post.generos) ? dados_post.generos : [];
    generos.forEach(genero => {
        const genero_container = document.createElement("div")
        genero_container.classList.add("genero_container")

        const nome_genero = document.createElement("p")
        nome_genero.classList.add("nome_genero")
        const pontos_genero = document.createElement("p")
        pontos_genero.classList.add("pontos_genero")

        generos_post.appendChild(genero_container)
        genero_container.appendChild(nome_genero)
        genero_container.appendChild(pontos_genero)

        nome_genero.innerText = genero.genero
        pontos_genero.innerText = genero.pontos
    })
    return post_container
}

function renderizar_markdown(markdown = ""){
    const linhas = String(markdown).replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let lista_aberta = null;

    function fechar_lista(){
        if (!lista_aberta) return;
        html.push(`</${lista_aberta}>`);
        lista_aberta = null;
    }

    function abrir_lista(tipo){
        if (lista_aberta === tipo) return;
        fechar_lista();
        lista_aberta = tipo;
        html.push(`<${tipo}>`);
    }

    for (const linha_original of linhas) {
        const linha = linha_original.trim();

        if (!linha) {
            fechar_lista();
            continue;
        }

        const titulo = linha.match(/^(#{1,6})\s+(.+)$/);
        if (titulo) {
            fechar_lista();
            const nivel = titulo[1].length;
            html.push(`<h${nivel}>${formatar_markdown_inline(titulo[2])}</h${nivel}>`);
            continue;
        }

        const item_lista = linha.match(/^[-*]\s+(.+)$/);
        if (item_lista) {
            abrir_lista("ul");
            html.push(`<li>${formatar_markdown_inline(item_lista[1])}</li>`);
            continue;
        }

        const item_lista_ordenada = linha.match(/^\d+[.)]\s+(.+)$/);
        if (item_lista_ordenada) {
            abrir_lista("ol");
            html.push(`<li>${formatar_markdown_inline(item_lista_ordenada[1])}</li>`);
            continue;
        }

        const citacao = linha.match(/^>\s+(.+)$/);
        if (citacao) {
            fechar_lista();
            html.push(`<blockquote>${formatar_markdown_inline(citacao[1])}</blockquote>`);
            continue;
        }

        fechar_lista();
        html.push(`<p>${formatar_markdown_inline(linha)}</p>`);
    }

    fechar_lista();
    return html.join("");
}

function formatar_markdown_inline(texto){
    let seguro = escapar_html(texto);
    seguro = seguro.replace(/`([^`]+)`/g, "<code>$1</code>");
    seguro = seguro.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    seguro = seguro.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    seguro = seguro.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    seguro = seguro.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
    return seguro;
}

function escapar_html(texto){
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
