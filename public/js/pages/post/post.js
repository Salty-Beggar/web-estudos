import { api_fetch, extrair_mensagem, extrair_lista, normalizar_post } from "/js/app/api.js";
import { abrir_modal_criar_conteudo } from "/js/components/criador_conteudo.js";

export async function load_post_page(param) {
    const id = param[1];
    await renderizar_post_detalhe(id);
}

async function renderizar_post_detalhe(id) {
    const dados_post = await buscar_dados_post(id);

    const root = document.getElementById("root");
    root.innerHTML = "";
    root.appendChild(criar_post_base(dados_post));

    if (dados_post.tipo === "artigo") {
        inserir_informacoes_artigo(dados_post, dados_post.corpo ?? "");
    } else if (dados_post.tipo === "atividade") {
        inserir_informacoes_atividade(dados_post);
    } else if (dados_post.tipo === "curso") {
        inserir_informacoes_curso(dados_post);
    } else if (dados_post.tipo === "prova") {
        inserir_informacoes_prova(dados_post);
    } else {
        inserir_informacoes_texto(dados_post.descricao ?? "");
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
    const acoes_atividade = document.createElement("div");
    acoes_atividade.classList.add("acoes_atividade_post");
    const botao_add_prova = document.createElement("button");
    botao_add_prova.type = "button";
    botao_add_prova.classList.add("botao_adicionar_post_curso_detalhe");
    botao_add_prova.innerText = "Adicionar a prova";
    botao_add_prova.addEventListener("click", () => abrir_modal_adicionar_atividade_prova(dados_post));
    acoes_atividade.appendChild(botao_add_prova);

    atividade.appendChild(botao_confirmar);
    atividade.appendChild(feedback);
    atividade.appendChild(acoes_atividade);
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

    const curso = document.createElement("section");
    curso.classList.add("curso_material");

    const cabecalho = document.createElement("div");
    cabecalho.classList.add("curso_material_cabecalho");

    const etiqueta = document.createElement("p");
    etiqueta.classList.add("curso_etiqueta");
    etiqueta.innerText = "Curso";

    const titulo = document.createElement("h2");
    titulo.innerText = "Itens do curso";

    const descricao = document.createElement("p");
    descricao.innerText = "Os itens ficam organizados por tipo para facilitar o estudo.";

    const acoesCurso = document.createElement("div");
    acoesCurso.classList.add("curso_acoes_cabecalho");
    [
        ["Criar artigo", "artigo"],
        ["Criar atividade", "atividade"],
        ["Criar prova", "prova"]
    ].forEach(([textoBotao, tipo]) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("botao_adicionar_post_curso_detalhe");
        botao.innerText = textoBotao;
        botao.addEventListener("click", () => {
            abrir_modal_criar_conteudo({
                curso: dados_post,
                tipo,
                onSuccess: async () => {
                    const atualizados = await buscar_dados_post(dados_post.id);
                    inserir_informacoes_curso(atualizados);
                }
            });
        });
        acoesCurso.appendChild(botao);
    });

    cabecalho.appendChild(etiqueta);
    cabecalho.appendChild(titulo);
    cabecalho.appendChild(descricao);
    cabecalho.appendChild(acoesCurso);
    curso.appendChild(cabecalho);

    const grupos = dados_post.posts_por_tipo ?? agrupar_posts_curso(dados_post.posts ?? []);
    const ordem = [
        ["artigos", "Artigos"],
        ["atividades", "Atividades"],
        ["provas", "Provas"],
        ["questionarios", "Questionários"],
        ["outros", "Outros"]
    ];

    const total = ordem.reduce((soma, [chave]) => soma + (grupos[chave]?.length ?? 0), 0);
    if (total === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("curso_posts_vazio");
        vazio.innerText = "Esse curso ainda não tem posts.";
        curso.appendChild(vazio);
        corpo_material.appendChild(curso);
        return;
    }

    ordem.forEach(([chave, tituloGrupo]) => {
        const posts = grupos[chave] ?? [];
        if (posts.length === 0) return;

        const grupo = document.createElement("section");
        grupo.classList.add("curso_grupo_tipo");

        const subtitulo = document.createElement("h3");
        subtitulo.innerText = tituloGrupo;
        grupo.appendChild(subtitulo);

        const lista = document.createElement("div");
        lista.classList.add("curso_lista_posts");

        posts.forEach((post, index) => lista.appendChild(criar_item_curso(post, index, dados_post)));
        grupo.appendChild(lista);
        curso.appendChild(grupo);
    });

    corpo_material.appendChild(curso);
}

function agrupar_posts_curso(posts){
    const grupos = { artigos: [], atividades: [], provas: [], questionarios: [], outros: [] };
    posts.forEach(post => {
        const tipo = post.tipo_nome ?? normalizar_tipo_curso(post.tipo);
        if (tipo === "artigo") grupos.artigos.push(post);
        else if (tipo === "atividade") grupos.atividades.push(post);
        else if (tipo === "prova") grupos.provas.push(post);
        else if (tipo === "questionario") grupos.questionarios.push(post);
        else grupos.outros.push(post);
    });
    return grupos;
}

function criar_item_curso(post, index, curso_atual = null){
    const item = document.createElement("div");
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.classList.add("curso_post_item");

    const numero = document.createElement("span");
    numero.classList.add("curso_post_numero");
    numero.innerText = String(index + 1).padStart(2, "0");

    const conteudo = document.createElement("span");
    conteudo.classList.add("curso_post_conteudo");

    const titulo_post = document.createElement("strong");
    titulo_post.innerText = post.titulo ?? `Post ${post.id}`;

    const meta = document.createElement("small");
    const tipo = post.tipo_nome ?? normalizar_tipo_curso(post.tipo);
    const categorias = Array.isArray(post.categorias) && post.categorias.length > 0
        ? ` • ${post.categorias.map(categoria => categoria.nome ?? categoria.genero).filter(Boolean).slice(0, 3).join(', ')}`
        : "";
    meta.innerText = `${tipo}${categorias}`;

    conteudo.appendChild(titulo_post);
    conteudo.appendChild(meta);
    item.appendChild(numero);
    item.appendChild(conteudo);

    const abrirPost = async () => {
        history.pushState(null, null, `/Post/${post.id}`);
        const { routes } = await import("/js/app/router.js");
        await routes.executar();
    };
    item.addEventListener("click", abrirPost);
    item.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrirPost();
        }
    });

    const tipoItem = post.tipo_nome ?? normalizar_tipo_curso(post.tipo);
    if (tipoItem === "atividade" && curso_atual?.id) {
        const acao = document.createElement("button");
        acao.type = "button";
        acao.classList.add("botao_mover_atividade_prova");
        acao.innerText = "Adicionar à prova";
        acao.addEventListener("click", (evento) => {
            evento.stopPropagation();
            abrir_modal_adicionar_atividade_prova(post, curso_atual);
        });
        item.appendChild(acao);
    }
    return item;
}

function normalizar_tipo_curso(tipo){
    const tipos = { 1: "curso", 2: "artigo", 3: "questionario", 4: "atividade", 5: "prova" };
    return tipos[Number(tipo)] ?? "post";
}

function buscar_usuario_atual_local(){
    try {
        return JSON.parse(localStorage.getItem("usuario") ?? "{}");
    } catch {
        return {};
    }
}

function post_pertence_ao_usuario_atual(dados_post){
    const usuarioAtual = buscar_usuario_atual_local();
    return Boolean(usuarioAtual?.id) && Number(dados_post.usuario_id) === Number(usuarioAtual.id);
}

function criar_acoes_publicacao_post(dados_post){
    const container = document.createElement("div");
    container.classList.add("acoes_publicacao_post");

    const status = document.createElement("p");
    status.classList.add("status_publicacao_post", dados_post.publicado ? "publicado" : "rascunho");
    status.innerText = dados_post.publicado ? "Publicado" : "Rascunho";
    container.appendChild(status);

    if (!dados_post.publicado && post_pertence_ao_usuario_atual(dados_post)) {
        const botaoPublicar = document.createElement("button");
        botaoPublicar.type = "button";
        botaoPublicar.classList.add("botao_publicar_post");
        botaoPublicar.innerText = "Postar";

        const mensagem = document.createElement("p");
        mensagem.classList.add("mensagem_publicacao_post");
        mensagem.setAttribute("aria-live", "polite");

        botaoPublicar.addEventListener("click", async () => {
            botaoPublicar.disabled = true;
            botaoPublicar.innerText = "Postando...";
            mensagem.innerText = "";

            try {
                await api_fetch(`/post/publicar/${dados_post.id}`, {
                    method: "PUT",
                    body: {}
                });

                dados_post.publicado = true;
                await renderizar_post_detalhe(dados_post.id);
            } catch (erro) {
                mensagem.innerText = erro.message;
                botaoPublicar.disabled = false;
                botaoPublicar.innerText = "Postar";
            }
        });

        container.appendChild(botaoPublicar);
        container.appendChild(mensagem);
    }

    return container;
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
    dados_do_post.appendChild(criar_acoes_publicacao_post(dados_post))

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

    if (dados_post.tipo !== "curso") {
        const acoesPost = document.createElement("div");
        acoesPost.classList.add("acoes_post_detalhe");

        const botaoAdicionar = document.createElement("button");
        botaoAdicionar.type = "button";
        botaoAdicionar.classList.add("botao_adicionar_post_curso", "botao_adicionar_post_curso_detalhe");
        botaoAdicionar.innerText = "Adicionar a curso";
        botaoAdicionar.addEventListener("click", () => abrir_modal_adicionar_post_curso(dados_post));
        acoesPost.appendChild(botaoAdicionar);

        if (dados_post.tipo === "atividade") {
            const botaoProva = document.createElement("button");
            botaoProva.type = "button";
            botaoProva.classList.add("botao_adicionar_post_curso", "botao_adicionar_post_curso_detalhe");
            botaoProva.innerText = "Adicionar a prova";
            botaoProva.addEventListener("click", () => abrir_modal_adicionar_atividade_prova(dados_post));
            acoesPost.appendChild(botaoProva);
        }

        dados_do_post.appendChild(acoesPost);
    }

    return post_container
}


function criar_topo_modal_post_curso(tituloTexto, subtituloTexto, fecharCallback){
    const topo = document.createElement("header");
    topo.classList.add("criador_topo", "topo_modal_post_curso");

    const textos = document.createElement("div");
    const titulo = document.createElement("h2");
    titulo.innerText = tituloTexto;
    const subtitulo = document.createElement("p");
    subtitulo.innerText = subtituloTexto;
    textos.append(titulo, subtitulo);

    const acoes = document.createElement("div");
    acoes.classList.add("criador_topo_acoes");

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.classList.add("botao_cancelar_feed", "botao_criador_fechar");
    fechar.innerText = "Fechar";
    fechar.addEventListener("click", fecharCallback);

    acoes.appendChild(fechar);
    topo.append(textos, acoes);
    return topo;
}

function criar_campo_rapido_modal(labelTexto, placeholder){
    const label = document.createElement("label");
    label.classList.add("campo_criador", "campo_modal_post_curso");

    const texto = document.createElement("span");
    texto.innerText = labelTexto;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.maxLength = 200;

    label.append(texto, input);
    return { label, input };
}

async function abrir_modal_adicionar_post_curso(post){
    fechar_modal_curso_post();

    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay", "modal_post_curso_overlay");
    overlay.id = "modal_adicionar_post_curso";

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_post_curso", "modal_criador_conteudo");

    const topo = criar_topo_modal_post_curso(
        "Adicionar post a curso",
        `Escolha um curso para receber: ${post.titulo ?? 'post sem título'}.`,
        fechar_modal_curso_post
    );

    const lista = document.createElement("div");
    lista.classList.add("lista_cursos_modal", "lista_modal_post_curso");

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed", "mensagem_criador");
    mensagem.setAttribute("aria-live", "polite");

    const form = document.createElement("form");
    form.classList.add("form_criar_curso_rapido", "form_modal_post_curso");
    const campoTitulo = criar_campo_rapido_modal("Novo curso", "Ex: Curso de JavaScript");
    const inputTitulo = campoTitulo.input;
    const botaoCriar = document.createElement("button");
    botaoCriar.type = "submit";
    botaoCriar.classList.add("botao_salvar_feed");
    botaoCriar.innerText = "Criar e adicionar";
    form.append(campoTitulo.label, botaoCriar);

    modal.append(topo, lista, form, mensagem);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) fechar_modal_curso_post();
    });

    try {
        const cursos = await buscar_cursos_usuario();
        renderizar_lista_cursos(cursos, lista, post, mensagem);
    } catch (erro) {
        mensagem.innerText = erro.message;
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const tituloCurso = inputTitulo.value.trim();
        if (!tituloCurso) {
            mensagem.innerText = "Digite o título do curso.";
            return;
        }
        botaoCriar.disabled = true;
        botaoCriar.innerText = "Criando...";
        mensagem.innerText = "";
        try {
            const categorias = (post.generos ?? []).map(genero => Number(genero.id)).filter(Boolean);
            const dadosCurso = await api_fetch("/curso/add", {
                method: "POST",
                body: { titulo: tituloCurso, categorias }
            });
            const curso = extrair_mensagem(dadosCurso);
            await adicionar_post_ao_curso(curso.id, post.id);
            fechar_modal_curso_post();
        } catch (erro) {
            mensagem.innerText = erro.message;
            botaoCriar.disabled = false;
            botaoCriar.innerText = "Criar e adicionar";
        }
    });
}

async function buscar_cursos_usuario(){
    const dados = await api_fetch("/curso/usuario");
    return extrair_lista(dados, ["cursos"]);
}

function renderizar_lista_cursos(cursos, lista, post, mensagem){
    lista.innerHTML = "";
    if (!Array.isArray(cursos) || cursos.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("curso_modal_vazio");
        vazio.innerText = "Você ainda não tem cursos. Crie um curso abaixo para adicionar esse post.";
        lista.appendChild(vazio);
        return;
    }

    cursos.forEach(curso => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("botao_curso_modal");
        botao.innerText = curso.titulo ?? `Curso ${curso.id}`;
        botao.addEventListener("click", async () => {
            botao.disabled = true;
            botao.innerText = "Adicionando...";
            mensagem.innerText = "";
            try {
                await adicionar_post_ao_curso(curso.id, post.id);
                fechar_modal_curso_post();
            } catch (erro) {
                mensagem.innerText = erro.message;
                botao.disabled = false;
                botao.innerText = curso.titulo ?? `Curso ${curso.id}`;
            }
        });
        lista.appendChild(botao);
    });
}

async function adicionar_post_ao_curso(curso_id, post_id){
    await api_fetch("/curso/post/add", {
        method: "PUT",
        body: { curso_id: Number(curso_id), post_id: Number(post_id) }
    });
}

function fechar_modal_curso_post(){
    document.getElementById("modal_adicionar_post_curso")?.remove();
}



function inserir_informacoes_prova(dados_post){
    const corpo_material = document.querySelector(".material_post");
    corpo_material.innerHTML = "";

    const prova = document.createElement("section");
    prova.classList.add("prova_container");

    const cabecalho = document.createElement("header");
    cabecalho.classList.add("prova_cabecalho");

    const topo = document.createElement("div");
    topo.classList.add("prova_cabecalho_topo");

    const etiqueta = document.createElement("p");
    etiqueta.classList.add("curso_etiqueta");
    etiqueta.innerText = "Prova";

    const titulo = document.createElement("h2");
    titulo.innerText = dados_post.titulo ?? "Prova";

    const descricao = document.createElement("p");
    descricao.innerText = dados_post.descricao_prova || dados_post.descricao || "Responda as atividades e finalize para calcular a nota.";

    topo.appendChild(etiqueta);
    topo.appendChild(titulo);
    topo.appendChild(descricao);

    const configuracoes = document.createElement("div");
    configuracoes.classList.add("prova_configuracoes");

    const labelFormato = document.createElement("label");
    labelFormato.innerText = "Formato da nota";
    const selectFormato = document.createElement("select");
    selectFormato.innerHTML = `<option value="dez">0 a 10</option><option value="porcentagem">Porcentagem</option>`;
    selectFormato.value = dados_post.formato_nota === "porcentagem" ? "porcentagem" : "dez";
    labelFormato.appendChild(selectFormato);

    const labelNulas = document.createElement("label");
    labelNulas.classList.add("prova_check_config");
    const checkNulas = document.createElement("input");
    checkNulas.type = "checkbox";
    checkNulas.checked = dados_post.permitir_resposta_nula !== false;
    const textoNulas = document.createElement("span");
    textoNulas.innerText = "Contar respostas em branco como erro";
    labelNulas.append(checkNulas, textoNulas);

    const labelResultado = document.createElement("label");
    labelResultado.classList.add("prova_check_config");
    const checkResultado = document.createElement("input");
    checkResultado.type = "checkbox";
    checkResultado.checked = dados_post.mostrar_resultado_imediato !== false;
    const textoResultado = document.createElement("span");
    textoResultado.innerText = "Permitir verificar cada questão";
    labelResultado.append(checkResultado, textoResultado);

    configuracoes.append(labelFormato, labelNulas, labelResultado);

    const resultado = document.createElement("div");
    resultado.classList.add("prova_resultado");
    resultado.setAttribute("aria-live", "polite");

    cabecalho.append(topo, configuracoes, resultado);
    prova.appendChild(cabecalho);

    const lista = document.createElement("div");
    lista.classList.add("prova_lista_atividades");
    prova.appendChild(lista);

    const atividades = Array.isArray(dados_post.atividades) ? dados_post.atividades : [];
    const estado = {
        respostas: new Map(),
        corrigidas: new Set(),
        formato: selectFormato.value,
        contarNulas: checkNulas.checked,
        permitirVerificacao: checkResultado.checked
    };

    if (atividades.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("curso_posts_vazio");
        vazio.innerText = "Essa prova ainda não tem atividades.";
        lista.appendChild(vazio);
    } else {
        atividades.forEach((atividade, index) => {
            lista.appendChild(criar_item_prova_atividade(atividade, index, estado, resultado, atividades));
        });
    }

    const acoes = document.createElement("div");
    acoes.classList.add("prova_acoes");
    const finalizar = document.createElement("button");
    finalizar.type = "button";
    finalizar.classList.add("botao_confirmar_atividade");
    finalizar.innerText = "Finalizar prova e calcular nota";
    finalizar.addEventListener("click", () => {
        atividades.forEach(atividade => estado.corrigidas.add(Number(atividade.id)));
        lista.querySelectorAll(".prova_atividade_item").forEach(item => corrigir_item_prova(item, estado));
        atualizar_painel_resultado_prova(resultado, atividades, estado, true);
    });
    acoes.appendChild(finalizar);
    prova.appendChild(acoes);

    selectFormato.addEventListener("change", () => {
        estado.formato = selectFormato.value;
        atualizar_painel_resultado_prova(resultado, atividades, estado);
    });
    checkNulas.addEventListener("change", () => {
        estado.contarNulas = checkNulas.checked;
        atualizar_painel_resultado_prova(resultado, atividades, estado);
    });
    checkResultado.addEventListener("change", () => {
        estado.permitirVerificacao = checkResultado.checked;
        lista.querySelectorAll(".botao_verificar_questao").forEach(botao => botao.disabled = !estado.permitirVerificacao);
    });

    atualizar_painel_resultado_prova(resultado, atividades, estado);
    corpo_material.appendChild(prova);
}

function criar_item_prova_atividade(atividade, index, estado, resultado, atividades){
    const item = document.createElement("article");
    item.classList.add("prova_atividade_item");
    item.dataset.atividadeId = atividade.id;
    item.dataset.respostaCerta = atividade.resposta_certa;

    const topo = document.createElement("div");
    topo.classList.add("prova_atividade_topo");
    const numero = document.createElement("span");
    numero.classList.add("curso_post_numero");
    numero.innerText = String(index + 1).padStart(2, "0");
    const titulo = document.createElement("h3");
    titulo.innerText = atividade.titulo ?? `Questão ${index + 1}`;
    topo.append(numero, titulo);

    const texto = document.createElement("div");
    texto.classList.add("atividade_texto", "corpo_markdown");
    texto.innerHTML = renderizar_markdown(atividade.texto_atividade || "Leia a questão e escolha uma alternativa.");

    const enunciado = document.createElement("p");
    enunciado.classList.add("atividade_enunciado");
    enunciado.innerText = atividade.enunciado ?? "Sem enunciado.";

    const opcoesContainer = document.createElement("div");
    opcoesContainer.classList.add("opcoes_atividade");
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const opcoes = [...(atividade.opcoes ?? [])].sort((a, b) => Number(a.ordem) - Number(b.ordem));

    opcoes.forEach((opcao, opcaoIndex) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("opcao_atividade");
        botao.dataset.ordem = opcao.ordem;

        const letra = document.createElement("span");
        letra.classList.add("opcao_letra");
        letra.innerText = letras[opcaoIndex] ?? String(opcaoIndex + 1);

        const textoOpcao = document.createElement("span");
        textoOpcao.classList.add("opcao_texto");
        textoOpcao.innerText = opcao.texto ?? "Alternativa sem texto";

        botao.append(letra, textoOpcao);
        botao.addEventListener("click", () => {
            estado.respostas.set(Number(atividade.id), Number(opcao.ordem));
            item.classList.remove("prova_atividade_corrigida");
            estado.corrigidas.delete(Number(atividade.id));
            opcoesContainer.querySelectorAll(".opcao_atividade").forEach(opcaoBotao => {
                opcaoBotao.classList.remove("opcao_atividade_selecionada", "opcao_atividade_correta", "opcao_atividade_errada");
            });
            botao.classList.add("opcao_atividade_selecionada");
            feedback.innerText = "";
            feedback.className = "feedback_atividade";
            atualizar_painel_resultado_prova(resultado, atividades, estado);
        });

        opcoesContainer.appendChild(botao);
    });

    const feedback = document.createElement("p");
    feedback.classList.add("feedback_atividade");

    const verificar = document.createElement("button");
    verificar.type = "button";
    verificar.classList.add("botao_verificar_questao", "botao_confirmar_atividade");
    verificar.innerText = "Verificar questão";
    verificar.disabled = !estado.permitirVerificacao;
    verificar.addEventListener("click", () => {
        const resposta = estado.respostas.get(Number(atividade.id));
        if (!resposta) {
            feedback.classList.add("feedback_atividade_alerta");
            feedback.innerText = "Essa questão ainda está em branco.";
            return;
        }
        estado.corrigidas.add(Number(atividade.id));
        corrigir_item_prova(item, estado, feedback, atividade);
        atualizar_painel_resultado_prova(resultado, atividades, estado);
    });

    item.append(topo, texto, enunciado, opcoesContainer, verificar, feedback);
    return item;
}

function corrigir_item_prova(item, estado, feedbackElemento = null, atividade = null){
    const atividadeID = Number(item.dataset.atividadeId);
    const respostaCerta = Number(item.dataset.respostaCerta);
    const resposta = estado.respostas.get(atividadeID);
    const acertou = resposta === respostaCerta;

    item.classList.add("prova_atividade_corrigida");
    item.querySelectorAll(".opcao_atividade").forEach(opcao => {
        const ordem = Number(opcao.dataset.ordem);
        opcao.classList.toggle("opcao_atividade_correta", ordem === respostaCerta);
        opcao.classList.toggle("opcao_atividade_errada", ordem === resposta && !acertou);
    });

    const feedback = feedbackElemento ?? item.querySelector(".feedback_atividade");
    if (feedback) {
        feedback.className = "feedback_atividade";
        feedback.classList.add(acertou ? "feedback_atividade_correto" : "feedback_atividade_errado");
        const explicacao = atividade?.explicacao_atividade ? ` ${atividade.explicacao_atividade}` : "";
        feedback.innerText = acertou ? `Resposta correta.${explicacao}` : `Resposta incorreta.${explicacao}`;
    }
}

function calcular_resultado_prova(atividades, estado){
    let certas = 0;
    let erradas = 0;
    let nulas = 0;

    atividades.forEach(atividade => {
        const resposta = estado.respostas.get(Number(atividade.id));
        if (!resposta) {
            nulas++;
            return;
        }
        if (Number(resposta) === Number(atividade.resposta_certa)) certas++;
        else erradas++;
    });

    const totalQuestoes = atividades.length;
    const totalParaNota = estado.contarNulas ? totalQuestoes : Math.max(1, certas + erradas);
    const proporcao = totalParaNota === 0 ? 0 : certas / totalParaNota;
    const nota10 = proporcao * 10;
    const porcentagem = proporcao * 100;

    return { certas, erradas, nulas, totalQuestoes, totalParaNota, nota10, porcentagem };
}

function atualizar_painel_resultado_prova(container, atividades, estado, finalizada = false){
    const resultado = calcular_resultado_prova(atividades, estado);
    const nota = estado.formato === "porcentagem"
        ? `${resultado.porcentagem.toFixed(2)}%`
        : `${resultado.nota10.toFixed(2)} / 10`;

    container.innerHTML = `
        <strong>${finalizada ? "Resultado final" : "Resultado parcial"}</strong>
        <span>Acertos: ${resultado.certas}/${resultado.totalQuestoes}</span>
        <span>Erros: ${resultado.erradas}</span>
        <span>Em branco: ${resultado.nulas}</span>
        <span>Nota: ${nota}</span>
    `;
}

async function abrir_modal_adicionar_atividade_prova(atividade, curso_atual = null){
    fechar_modal_prova();

    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay", "modal_post_curso_overlay");
    overlay.id = "modal_adicionar_atividade_prova";

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_post_curso", "modal_criador_conteudo");

    const topo = criar_topo_modal_post_curso(
        "Adicionar atividade à prova",
        `Escolha uma prova para receber: ${atividade.titulo ?? 'atividade sem título'}.`,
        fechar_modal_prova
    );

    const lista = document.createElement("div");
    lista.classList.add("lista_cursos_modal", "lista_modal_post_curso");
    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed", "mensagem_criador");
    mensagem.setAttribute("aria-live", "polite");

    const form = document.createElement("form");
    form.classList.add("form_criar_curso_rapido", "form_modal_post_curso");
    const campoTitulo = criar_campo_rapido_modal(
        "Nova prova",
        curso_atual?.id ? "Ex: Prova deste curso" : "Ex: Prova de revisão"
    );
    const inputTitulo = campoTitulo.input;
    const botaoCriar = document.createElement("button");
    botaoCriar.type = "submit";
    botaoCriar.classList.add("botao_salvar_feed");
    botaoCriar.innerText = "Criar e adicionar";
    form.append(campoTitulo.label, botaoCriar);

    modal.append(topo, lista, form, mensagem);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", evento => { if (evento.target === overlay) fechar_modal_prova(); });

    try {
        const provas = await buscar_provas_usuario(curso_atual);
        renderizar_lista_provas(provas, lista, atividade, mensagem);
    } catch (erro) {
        mensagem.innerText = erro.message;
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const tituloProva = inputTitulo.value.trim();
        if (!tituloProva) {
            mensagem.innerText = "Digite o título da prova.";
            return;
        }
        botaoCriar.disabled = true;
        botaoCriar.innerText = "Criando...";
        try {
            const categorias = (atividade.generos ?? atividade.categorias ?? []).map(genero => Number(genero.id)).filter(Boolean);
            const dados = await api_fetch("/prova/add", {
                method: "POST",
                body: {
                    titulo: tituloProva,
                    descricao: `Prova criada a partir da atividade: ${atividade.titulo ?? ''}`,
                    categorias,
                    atividades: [Number(atividade.id)],
                    curso_id: curso_atual?.id ? Number(curso_atual.id) : undefined
                }
            });
            const prova = extrair_mensagem(dados);
            mensagem.innerText = `Adicionado em ${prova.titulo ?? 'prova'}.`;
            fechar_modal_prova();
        } catch (erro) {
            mensagem.innerText = erro.message;
            botaoCriar.disabled = false;
            botaoCriar.innerText = "Criar e adicionar";
        }
    });
}

async function buscar_provas_usuario(curso_atual = null){
    if (curso_atual?.posts) {
        const provasCurso = curso_atual.posts.filter(post => (post.tipo_nome ?? normalizar_tipo_curso(post.tipo)) === "prova");
        if (provasCurso.length > 0) return provasCurso;
    }
    if (curso_atual?.posts_por_tipo?.provas?.length) return curso_atual.posts_por_tipo.provas;
    const dados = await api_fetch("/prova/usuario");
    return extrair_lista(dados, ["provas"]);
}

function renderizar_lista_provas(provas, lista, atividade, mensagem){
    lista.innerHTML = "";
    if (!Array.isArray(provas) || provas.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("curso_modal_vazio");
        vazio.innerText = "Você ainda não tem provas. Crie uma prova abaixo para adicionar essa atividade.";
        lista.appendChild(vazio);
        return;
    }

    provas.forEach(prova => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("botao_curso_modal");
        botao.innerText = `${prova.titulo ?? `Prova ${prova.id}`} ${prova.qtd_atividades ? `(${prova.qtd_atividades} questões)` : ''}`;
        botao.addEventListener("click", async () => {
            botao.disabled = true;
            botao.innerText = "Adicionando...";
            mensagem.innerText = "";
            try {
                await api_fetch("/prova/atividade/add", {
                    method: "POST",
                    body: { prova_id: Number(prova.id), atividade_id: Number(atividade.id) }
                });
                fechar_modal_prova();
            } catch (erro) {
                mensagem.innerText = erro.message;
                botao.disabled = false;
                botao.innerText = prova.titulo ?? `Prova ${prova.id}`;
            }
        });
        lista.appendChild(botao);
    });
}

function abrir_modal_criar_prova_curso(curso){
    fechar_modal_prova();

    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay");
    overlay.id = "modal_criar_prova_curso";

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_post_curso");

    const titulo = document.createElement("h2");
    titulo.innerText = "Criar prova no curso";
    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const form = document.createElement("form");
    form.classList.add("form_criar_feed");

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Título da prova";
    input.required = true;
    input.maxLength = 200;

    const descricao = document.createElement("textarea");
    descricao.rows = 3;
    descricao.placeholder = "Descrição/configuração da prova";

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.classList.add("botao_cancelar_feed");
    cancelar.innerText = "Cancelar";
    cancelar.addEventListener("click", fechar_modal_prova);
    const salvar = document.createElement("button");
    salvar.type = "submit";
    salvar.classList.add("botao_salvar_feed");
    salvar.innerText = "Criar prova";
    acoes.append(cancelar, salvar);

    form.append(input, descricao, mensagem, acoes);
    modal.append(titulo, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    input.focus();
    overlay.addEventListener("click", evento => { if (evento.target === overlay) fechar_modal_prova(); });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        salvar.disabled = true;
        salvar.innerText = "Criando...";
        mensagem.innerText = "";
        try {
            const categorias = (curso.generos ?? curso.categorias ?? []).map(genero => Number(genero.id)).filter(Boolean);
            await api_fetch("/prova/add", {
                method: "POST",
                body: {
                    titulo: input.value.trim(),
                    descricao: descricao.value.trim(),
                    categorias,
                    curso_id: Number(curso.id)
                }
            });
            fechar_modal_prova();
            window.location.reload();
        } catch (erro) {
            mensagem.innerText = erro.message;
            salvar.disabled = false;
            salvar.innerText = "Criar prova";
        }
    });
}

function fechar_modal_prova(){
    document.getElementById("modal_adicionar_atividade_prova")?.remove();
    document.getElementById("modal_criar_prova_curso")?.remove();
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
