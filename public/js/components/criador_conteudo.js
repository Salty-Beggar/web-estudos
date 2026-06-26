import { api_fetch, extrair_mensagem, extrair_lista, normalizar_categoria } from "/js/app/api.js";

const TIPOS_CRIAVEIS = [
    { id: "curso", nome: "Curso", descricao: "Crie uma coleção de estudos para organizar artigos, atividades e provas." },
    { id: "artigo", nome: "Artigo", descricao: "Crie um texto de estudo formatado em Markdown." },
    { id: "atividade", nome: "Atividade", descricao: "Crie uma questão com alternativas e resposta correta." },
    { id: "prova", nome: "Prova", descricao: "Crie uma prova que pode receber várias atividades." }
];

export function abrir_modal_criar_conteudo(opcoes = {}) {
    fechar_modal_criar_conteudo();

    const estado = {
        tipo: opcoes.tipo ?? null,
        cursoAtual: opcoes.curso ?? null,
        onSuccess: typeof opcoes.onSuccess === "function" ? opcoes.onSuccess : null,
        cursos: [],
        categorias: [],
        carregando: false
    };

    const overlay = document.createElement("div");
    overlay.id = "modal_criador_conteudo";
    overlay.classList.add("modal_feed_overlay", "modal_criador_overlay");

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_criador_conteudo");

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", evento => {
        if (evento.target === overlay) fechar_modal_criar_conteudo();
    });

    if (estado.tipo) renderizar_formulario_tipo(modal, estado);
    else renderizar_etapa_tipo(modal, estado);
    carregar_dados_auxiliares(estado, modal);
}

export function fechar_modal_criar_conteudo() {
    document.getElementById("modal_criador_conteudo")?.remove();
}

async function carregar_dados_auxiliares(estado, modal) {
    try {
        const [dadosCursos, dadosCategorias] = await Promise.allSettled([
            api_fetch("/curso/usuario"),
            api_fetch("/categoria")
        ]);

        if (dadosCursos.status === "fulfilled") {
            estado.cursos = extrair_lista(dadosCursos.value, ["cursos"]);
        }

        if (dadosCategorias.status === "fulfilled") {
            estado.categorias = extrair_lista(dadosCategorias.value, ["categorias", "generos"]).map(normalizar_categoria);
        }

        if (estado.tipo) renderizar_formulario_tipo(modal, estado);
    } catch (erro) {
        console.warn("Não foi possível carregar dados do criador:", erro.message);
    }
}

function criar_topo_modal(tituloTexto, subtituloTexto, voltar = null) {
    const topo = document.createElement("header");
    topo.classList.add("criador_topo");

    const textos = document.createElement("div");
    const titulo = document.createElement("h2");
    titulo.innerText = tituloTexto;
    const subtitulo = document.createElement("p");
    subtitulo.innerText = subtituloTexto;
    textos.append(titulo, subtitulo);

    const acoes = document.createElement("div");
    acoes.classList.add("criador_topo_acoes");

    if (voltar) {
        const botaoVoltar = document.createElement("button");
        botaoVoltar.type = "button";
        botaoVoltar.classList.add("botao_cancelar_feed", "botao_criador_secundario");
        botaoVoltar.innerText = "Voltar";
        botaoVoltar.addEventListener("click", voltar);
        acoes.appendChild(botaoVoltar);
    }

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.classList.add("botao_cancelar_feed", "botao_criador_fechar");
    fechar.innerText = "Fechar";
    fechar.addEventListener("click", fechar_modal_criar_conteudo);
    acoes.appendChild(fechar);

    topo.append(textos, acoes);
    return topo;
}

function renderizar_etapa_tipo(modal, estado) {
    modal.innerHTML = "";
    modal.appendChild(criar_topo_modal(
        "Criar conteúdo",
        estado.cursoAtual?.id
            ? `Novo item dentro do curso: ${estado.cursoAtual.titulo ?? "curso atual"}.`
            : "Escolha o tipo de conteúdo que você quer criar."
    ));

    const lista = document.createElement("div");
    lista.classList.add("criador_tipos");

    TIPOS_CRIAVEIS.forEach(tipo => {
        if (estado.cursoAtual?.id && tipo.id === "curso") return;
        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("criador_tipo_card");
        botao.innerHTML = `<strong>${escapar_html(tipo.nome)}</strong><span>${escapar_html(tipo.descricao)}</span>`;
        botao.addEventListener("click", () => {
            estado.tipo = tipo.id;
            renderizar_formulario_tipo(modal, estado);
        });
        lista.appendChild(botao);
    });

    modal.appendChild(lista);
}

function renderizar_formulario_tipo(modal, estado) {
    const tipoInfo = TIPOS_CRIAVEIS.find(tipo => tipo.id === estado.tipo);
    modal.innerHTML = "";
    modal.appendChild(criar_topo_modal(
        `Criar ${tipoInfo?.nome?.toLowerCase() ?? "conteúdo"}`,
        texto_subtitulo_formulario(estado),
        () => renderizar_etapa_tipo(modal, estado)
    ));

    const form = document.createElement("form");
    form.classList.add("form_criar_feed", "form_criador_conteudo");

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed", "mensagem_criador");
    mensagem.setAttribute("aria-live", "polite");

    if (estado.tipo === "curso") {
        form.appendChild(campo_texto("titulo", "Título do curso", "Ex: Curso de JavaScript", true));
        form.appendChild(campo_textarea("descricao", "Descrição", "Explique o objetivo do curso", 3));
        form.appendChild(seletor_categorias(estado, "categorias", "Categorias do curso"));
    }

    if (estado.tipo === "artigo") {
        form.appendChild(campo_texto("titulo", "Título do artigo", "Ex: Como usar rotas no front-end", true));
        form.appendChild(campo_textarea("corpo", "Texto em Markdown", "# Título\n\nTexto com **negrito**, *itálico* e listas.\n\n- Item 1\n- Item 2", 8, true));
        form.appendChild(seletor_categorias(estado, "categorias", "Categorias do artigo"));
        form.appendChild(area_curso_destino(estado));
    }

    if (estado.tipo === "atividade") {
        form.appendChild(campo_texto("titulo", "Título da atividade", "Ex: Atividade: seletores CSS", true));
        form.appendChild(campo_textarea("texto", "Texto/instrução", "Leia a questão e escolha a alternativa correta.", 3));
        form.appendChild(campo_textarea("enunciado", "Enunciado", "Qual alternativa descreve melhor...", 4, true));
        form.appendChild(criar_editor_alternativas());
        form.appendChild(campo_textarea("explicacao", "Explicação da resposta", "Explique por que a alternativa correta está certa.", 3));
        form.appendChild(seletor_categorias(estado, "categorias", "Categorias da atividade"));
        form.appendChild(area_curso_destino(estado));
    }

    if (estado.tipo === "prova") {
        form.appendChild(campo_texto("titulo", "Título da prova", "Ex: Prova de revisão de PHP", true));
        form.appendChild(campo_textarea("descricao", "Descrição", "Explique o conteúdo da prova", 4));
        form.appendChild(criar_configuracoes_prova());
        form.appendChild(seletor_categorias(estado, "categorias", "Categorias da prova"));
        form.appendChild(area_curso_destino(estado));
    }

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed", "acoes_criador");
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.classList.add("botao_cancelar_feed");
    cancelar.innerText = "Cancelar";
    cancelar.addEventListener("click", fechar_modal_criar_conteudo);
    const salvar = document.createElement("button");
    salvar.type = "submit";
    salvar.classList.add("botao_salvar_feed");
    salvar.innerText = estado.tipo === "curso" ? "Criar curso" : "Criar e adicionar ao curso";
    acoes.append(cancelar, salvar);

    form.append(mensagem, acoes);
    modal.appendChild(form);

    form.addEventListener("submit", async evento => {
        evento.preventDefault();
        await enviar_formulario_criador(form, estado, mensagem, salvar);
    });
}

function texto_subtitulo_formulario(estado) {
    if (estado.tipo === "curso") return "Cursos começam privados e aparecem em Meus cursos.";
    if (estado.cursoAtual?.id) return "O item criado será adicionado diretamente ao curso aberto.";
    return "Depois de criar, escolha um curso existente ou crie um curso novo para guardar o item.";
}

function campo_texto(nome, labelTexto, placeholder, obrigatorio = false) {
    const label = document.createElement("label");
    label.classList.add("campo_criador");
    label.innerHTML = `<span>${escapar_html(labelTexto)}${obrigatorio ? " *" : ""}</span>`;
    const input = document.createElement("input");
    input.type = "text";
    input.name = nome;
    input.placeholder = placeholder;
    input.maxLength = 200;
    input.required = obrigatorio;
    label.appendChild(input);
    return label;
}

function campo_textarea(nome, labelTexto, placeholder, linhas = 4, obrigatorio = false) {
    const label = document.createElement("label");
    label.classList.add("campo_criador");
    label.innerHTML = `<span>${escapar_html(labelTexto)}${obrigatorio ? " *" : ""}</span>`;
    const textarea = document.createElement("textarea");
    textarea.name = nome;
    textarea.placeholder = placeholder;
    textarea.rows = linhas;
    textarea.required = obrigatorio;
    label.appendChild(textarea);
    return label;
}

function seletor_categorias(estado, nome, titulo) {
    const container = document.createElement("fieldset");
    container.classList.add("criador_categorias");
    container.dataset.name = nome;

    const legenda = document.createElement("legend");
    legenda.innerText = titulo;
    container.appendChild(legenda);

    if (!estado.categorias.length) {
        const vazio = document.createElement("p");
        vazio.classList.add("curso_modal_vazio");
        vazio.innerText = "Categorias não carregadas. O conteúdo pode ser criado sem categoria.";
        container.appendChild(vazio);
        return container;
    }

    const lista = document.createElement("div");
    lista.classList.add("criador_categorias_lista");
    estado.categorias.slice(0, 80).forEach(categoria => {
        const label = document.createElement("label");
        label.classList.add("checkbox_categoria_feed", "checkbox_criador_categoria");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = nome;
        input.value = categoria.id;
        const span = document.createElement("span");
        span.innerText = categoria.nome ?? categoria.genero;
        label.append(input, span);
        lista.appendChild(label);
    });
    container.appendChild(lista);
    return container;
}

function area_curso_destino(estado) {
    const area = document.createElement("section");
    area.classList.add("criador_destino_curso");

    const titulo = document.createElement("h3");
    titulo.innerText = "Adicionar a um curso";
    area.appendChild(titulo);

    if (estado.cursoAtual?.id) {
        const atual = document.createElement("p");
        atual.classList.add("criador_curso_atual");
        atual.innerText = `Curso atual: ${estado.cursoAtual.titulo ?? "curso sem título"}`;
        area.appendChild(atual);
        return area;
    }

    const cursos = Array.isArray(estado.cursos) ? estado.cursos : [];
    if (cursos.length > 0) {
        const label = document.createElement("label");
        label.classList.add("campo_criador");
        label.innerHTML = "<span>Escolher curso existente</span>";
        const select = document.createElement("select");
        select.name = "curso_id";
        select.innerHTML = '<option value="">Criar curso novo</option>';
        cursos.forEach(curso => {
            const option = document.createElement("option");
            option.value = curso.id;
            option.innerText = curso.titulo ?? `Curso ${curso.id}`;
            select.appendChild(option);
        });
        label.appendChild(select);
        area.appendChild(label);
    } else {
        const vazio = document.createElement("p");
        vazio.classList.add("curso_modal_vazio");
        vazio.innerText = "Você ainda não tem cursos. Crie um curso para guardar este item.";
        area.appendChild(vazio);
    }

    const detalhes = document.createElement("details");
    detalhes.classList.add("criador_curso_novo");
    if (cursos.length === 0) detalhes.open = true;
    const summary = document.createElement("summary");
    summary.innerText = cursos.length > 0 ? "Criar curso novo em vez de usar existente" : "Dados do curso novo";
    detalhes.appendChild(summary);
    detalhes.appendChild(campo_texto("novo_curso_titulo", "Título do novo curso", "Ex: Meu curso de revisão"));
    detalhes.appendChild(campo_textarea("novo_curso_descricao", "Descrição do novo curso", "Descreva o objetivo do curso", 3));
    detalhes.appendChild(seletor_categorias(estado, "novo_curso_categorias", "Categorias do novo curso"));
    area.appendChild(detalhes);

    return area;
}

function criar_editor_alternativas() {
    const container = document.createElement("section");
    container.classList.add("criador_alternativas");
    const titulo = document.createElement("h3");
    titulo.innerText = "Alternativas *";
    const lista = document.createElement("div");
    lista.classList.add("criador_lista_alternativas");

    const botaoAdicionar = document.createElement("button");
    botaoAdicionar.type = "button";
    botaoAdicionar.classList.add("botao_cancelar_feed", "botao_criador_secundario");
    botaoAdicionar.innerText = "Adicionar alternativa";

    function adicionarAlternativa(texto = "") {
        const indice = lista.children.length + 1;
        const linha = document.createElement("div");
        linha.classList.add("criador_alternativa_linha");

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "resposta_certa";
        radio.value = String(indice);
        radio.title = "Marcar como correta";

        const input = document.createElement("input");
        input.type = "text";
        input.name = "opcao";
        input.placeholder = `Alternativa ${indice}`;
        input.value = texto;

        const remover = document.createElement("button");
        remover.type = "button";
        remover.classList.add("botao_cancelar_feed", "botao_remover_alternativa");
        remover.innerText = "Remover";
        remover.addEventListener("click", () => {
            linha.remove();
            renumerarAlternativas(lista);
        });

        linha.append(radio, input, remover);
        lista.appendChild(linha);
        renumerarAlternativas(lista);
    }

    botaoAdicionar.addEventListener("click", () => adicionarAlternativa());
    adicionarAlternativa();
    adicionarAlternativa();

    container.append(titulo, lista, botaoAdicionar);
    return container;
}

function renumerarAlternativas(lista) {
    [...lista.children].forEach((linha, index) => {
        const ordem = index + 1;
        const radio = linha.querySelector('input[type="radio"]');
        const input = linha.querySelector('input[name="opcao"]');
        if (radio) radio.value = String(ordem);
        if (input) input.placeholder = `Alternativa ${ordem}`;
    });
}

function criar_configuracoes_prova() {
    const fieldset = document.createElement("fieldset");
    fieldset.classList.add("criador_config_prova");
    const legend = document.createElement("legend");
    legend.innerText = "Configurações da prova";

    const nota = document.createElement("label");
    nota.classList.add("campo_criador");
    nota.innerHTML = "<span>Formato da nota</span>";
    const select = document.createElement("select");
    select.name = "formato_nota";
    select.innerHTML = '<option value="dez">0 a 10</option><option value="porcentagem">Porcentagem</option>';
    nota.appendChild(select);

    const resultado = criar_checkbox_simples("mostrar_resultado_imediato", "Permitir verificar questões durante a prova", true);
    const nulas = criar_checkbox_simples("permitir_resposta_nula", "Permitir respostas em branco", true);

    fieldset.append(legend, nota, resultado, nulas);
    return fieldset;
}

function criar_checkbox_simples(nome, texto, marcado = false) {
    const label = document.createElement("label");
    label.classList.add("checkbox_categoria_feed", "checkbox_criador_simples");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = nome;
    input.checked = marcado;
    const span = document.createElement("span");
    span.innerText = texto;
    label.append(input, span);
    return label;
}

async function enviar_formulario_criador(form, estado, mensagem, salvar) {
    if (estado.carregando) return;
    estado.carregando = true;
    salvar.disabled = true;
    const textoOriginal = salvar.innerText;
    salvar.innerText = "Criando...";
    mensagem.innerText = "";

    try {
        let cursoDestinoID = null;
        if (estado.tipo !== "curso") {
            cursoDestinoID = await obter_curso_destino(form, estado);
            if (!cursoDestinoID) throw new Error("Escolha um curso ou crie um curso novo para guardar este item.");
        }

        const criado = await criar_conteudo(form, estado, cursoDestinoID);
        mensagem.innerText = "Criado com sucesso.";
        window.dispatchEvent(new CustomEvent("knowledgehub:cursosAtualizados"));
        window.dispatchEvent(new CustomEvent("knowledgehub:conteudoCriado", { detail: { tipo: estado.tipo, conteudo: criado, curso_id: cursoDestinoID } }));

        if (estado.onSuccess) await estado.onSuccess({ tipo: estado.tipo, conteudo: criado, curso_id: cursoDestinoID });
        fechar_modal_criar_conteudo();
    } catch (erro) {
        mensagem.innerText = erro.message;
        salvar.disabled = false;
        salvar.innerText = textoOriginal;
    } finally {
        estado.carregando = false;
    }
}

async function obter_curso_destino(form, estado) {
    if (estado.cursoAtual?.id) return Number(estado.cursoAtual.id);

    const select = form.querySelector('select[name="curso_id"]');
    const cursoSelecionado = Number(select?.value ?? 0);
    const detalhesNovoCurso = form.querySelector(".criador_curso_novo");
    const criandoNovo = !cursoSelecionado || detalhesNovoCurso?.open;

    if (!criandoNovo && cursoSelecionado > 0) return cursoSelecionado;

    const titulo = form.querySelector('[name="novo_curso_titulo"]')?.value.trim() ?? "";
    if (!titulo) {
        if (cursoSelecionado > 0) return cursoSelecionado;
        throw new Error("Digite o título do curso novo.");
    }

    const descricao = form.querySelector('[name="novo_curso_descricao"]')?.value.trim() ?? "";
    const categorias = valores_checkboxes(form, "novo_curso_categorias");
    const dados = await api_fetch("/curso/add", {
        method: "POST",
        body: { titulo, descricao, categorias, publicado: false }
    });
    const curso = extrair_mensagem(dados);
    const id = extrair_id(curso);
    if (!id) throw new Error("O backend criou o curso, mas não retornou o ID.");
    return id;
}

async function criar_conteudo(form, estado, cursoDestinoID) {
    const categorias = valores_checkboxes(form, "categorias");
    const titulo = form.querySelector('[name="titulo"]')?.value.trim() ?? "";
    if (!titulo) throw new Error("O título é obrigatório.");

    if (estado.tipo === "curso") {
        const descricao = form.querySelector('[name="descricao"]')?.value.trim() ?? "";
        const dados = await api_fetch("/curso/add", {
            method: "POST",
            body: { titulo, descricao, categorias, publicado: false }
        });
        return extrair_mensagem(dados);
    }

    if (estado.tipo === "artigo") {
        const corpo = form.querySelector('[name="corpo"]')?.value.trim() ?? "";
        if (!corpo) throw new Error("O texto do artigo é obrigatório.");
        const dados = await api_fetch("/artigo/add", {
            method: "POST",
            body: { titulo, corpo, formato: "markdown", categorias, curso_id: cursoDestinoID, publicado: false }
        });
        const artigo = extrair_mensagem(dados);
        await garantir_item_no_curso(cursoDestinoID, artigo);
        return artigo;
    }

    if (estado.tipo === "atividade") {
        const texto = form.querySelector('[name="texto"]')?.value.trim() ?? "";
        const enunciado = form.querySelector('[name="enunciado"]')?.value.trim() ?? "";
        const explicacao = form.querySelector('[name="explicacao"]')?.value.trim() ?? "";
        const opcoes = [...form.querySelectorAll('input[name="opcao"]')].map(input => input.value.trim()).filter(Boolean);
        const resposta_certa = Number(form.querySelector('input[name="resposta_certa"]:checked')?.value ?? 0);

        if (!enunciado) throw new Error("O enunciado da atividade é obrigatório.");
        if (opcoes.length < 2) throw new Error("A atividade precisa ter pelo menos duas alternativas.");
        if (!resposta_certa || resposta_certa > opcoes.length) throw new Error("Marque qual alternativa é a correta.");

        const dados = await api_fetch("/atividade/add", {
            method: "POST",
            body: { titulo, texto, enunciado, explicacao, opcoes, resposta_certa, categorias, curso_id: cursoDestinoID, publicado: false }
        });
        const atividade = extrair_mensagem(dados);
        await garantir_item_no_curso(cursoDestinoID, atividade);
        return atividade;
    }

    if (estado.tipo === "prova") {
        const descricao = form.querySelector('[name="descricao"]')?.value.trim() ?? "";
        const formato_nota = form.querySelector('[name="formato_nota"]')?.value ?? "dez";
        const mostrar_resultado_imediato = form.querySelector('[name="mostrar_resultado_imediato"]')?.checked ?? true;
        const permitir_resposta_nula = form.querySelector('[name="permitir_resposta_nula"]')?.checked ?? true;
        const dados = await api_fetch("/prova/add", {
            method: "POST",
            body: { titulo, descricao, formato_nota, nota_maxima: 10, mostrar_resultado_imediato, permitir_resposta_nula, categorias, curso_id: cursoDestinoID, publicado: false }
        });
        const prova = extrair_mensagem(dados);
        await garantir_item_no_curso(cursoDestinoID, prova);
        return prova;
    }

    throw new Error("Tipo de conteúdo inválido.");
}

async function garantir_item_no_curso(cursoID, item) {
    const postID = extrair_id(item);
    if (!cursoID || !postID) return;
    try {
        await api_fetch("/curso/post/add", {
            method: "POST",
            body: { curso_id: Number(cursoID), post_id: Number(postID) }
        });
    } catch (erro) {
        if (!/duplic|já|existe|sucesso/i.test(erro.message)) throw erro;
    }
}

function valores_checkboxes(form, nome) {
    return [...form.querySelectorAll(`input[name="${nome}"]:checked`)]
        .map(input => Number(input.value))
        .filter(Boolean);
}

function extrair_id(valor) {
    const item = extrair_mensagem(valor);
    return Number(item?.id ?? item?.post_id ?? item?.curso?.id ?? item?.post?.id ?? 0);
}

function escapar_html(texto = "") {
    const div = document.createElement("div");
    div.innerText = String(texto);
    return div.innerHTML;
}
