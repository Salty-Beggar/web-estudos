import { api_fetch, extrair_mensagem, extrair_lista } from "/js/app/api.js";

export function criar_post(objeto_post){
    const post = document.createElement("div");
    const autor_dados = document.createElement("div");
    const img_autor = document.createElement("img");
    const nome_autor = document.createElement("p");

    post.classList.add("post_container");
    autor_dados.classList.add("autor_dados");
    img_autor.classList.add("img_autor");
    nome_autor.classList.add("nome_autor");

    const post_dados = document.createElement("div");
    const titulo_post = document.createElement("h2");
    const tipo_post = document.createElement("p");
    const descricao_post = document.createElement("p");
    const postado_quando_post = document.createElement("p");
    const generos_post = document.createElement("div");

    post_dados.classList.add("post_dados");
    titulo_post.classList.add("titulo_post");
    tipo_post.classList.add("tipo_post");
    descricao_post.classList.add("descricao_post");
    postado_quando_post.classList.add("postado_quando_post");
    generos_post.classList.add("generos_post");

    post.appendChild(autor_dados);
    post.appendChild(post_dados);

    autor_dados.appendChild(img_autor);
    autor_dados.appendChild(nome_autor);

    post_dados.appendChild(titulo_post);
    post_dados.appendChild(tipo_post);
    post_dados.appendChild(descricao_post);
    post_dados.appendChild(postado_quando_post);
    post_dados.appendChild(generos_post);

    const autor = objeto_post.autor ?? {};
    img_autor.src = autor.img ?? "/assets/imgs/users/guest_user.svg";
    img_autor.onerror = () => { img_autor.src = "/assets/imgs/users/guest_user.svg"; };
    nome_autor.innerText = autor.nome ?? "Usuário";

    titulo_post.innerText = objeto_post.titulo ?? "Sem título";
    tipo_post.innerText = objeto_post.tipo ?? "post";
    descricao_post.innerText = objeto_post.descricao ?? "";
    postado_quando_post.innerText = calcular_tempo(objeto_post.data_criacao);
    
    titulo_post.addEventListener("click", async () => {
        history.pushState(null, null, `/Post/${objeto_post.id}`);
        const { routes } = await import("/js/app/router.js");
        routes.executar();
    });
    
    const generos = Array.isArray(objeto_post.generos) ? objeto_post.generos : [];
    const limite_generos_visiveis = 3;
    generos.forEach((genero, index) => {
        const genero_container = document.createElement("div");
        genero_container.classList.add("genero_container");
        if (index >= limite_generos_visiveis) genero_container.classList.add("genero_extra", "genero_oculto");
        genero_container.dataset.categoriaId = genero.id;
        genero_container.dataset.postId = objeto_post.id;
        genero_container.dataset.votoUsuario = genero.voto_usuario ?? 0;

        const nome_genero = document.createElement("p");
        nome_genero.classList.add("nome_genero");
        const pontos_genero = document.createElement("p");
        pontos_genero.classList.add("pontos_genero");
        const up_vote = document.createElement("button");
        up_vote.classList.add("up_vote");
        const down_vote = document.createElement("button");
        down_vote.classList.add("down_vote");

        generos_post.appendChild(genero_container);
        genero_container.appendChild(nome_genero);
        genero_container.appendChild(pontos_genero);
        genero_container.appendChild(up_vote);
        genero_container.appendChild(down_vote);

        nome_genero.innerText = genero.genero;
        pontos_genero.innerText = genero.pontos;
        up_vote.innerText = "UP";
        down_vote.innerText = "DOWN";
        up_vote.setAttribute("type", "button");
        down_vote.setAttribute("type", "button");

        atualizar_estado_voto(genero_container, Number(genero.voto_usuario ?? 0));
        up_vote.addEventListener("click", () => votar(genero_container, 1));
        down_vote.addEventListener("click", () => votar(genero_container, -1));
    });

    if (generos.length > limite_generos_visiveis) {
        const botaoMostrar = document.createElement("button");
        botaoMostrar.type = "button";
        botaoMostrar.classList.add("botao_mostrar_generos_post");
        botaoMostrar.innerText = `Mostrar mais ${generos.length - limite_generos_visiveis}`;
        botaoMostrar.addEventListener("click", () => {
            const expandido = generos_post.classList.toggle("generos_post_expandido");
            generos_post.querySelectorAll(".genero_extra").forEach(item => {
                item.classList.toggle("genero_oculto", !expandido);
            });
            botaoMostrar.innerText = expandido ? "Mostrar menos" : `Mostrar mais ${generos.length - limite_generos_visiveis}`;
        });
        generos_post.appendChild(botaoMostrar);
    }
   
    if(objeto_post.tipo == "curso"){
        botao_salvar_curso(autor_dados, objeto_post);
    } else {
        const botaoAdicionarCurso = document.createElement("button");
        botaoAdicionarCurso.type = "button";
        botaoAdicionarCurso.classList.add("botao_adicionar_post_curso");
        botaoAdicionarCurso.innerText = "Adicionar a curso";
        botaoAdicionarCurso.addEventListener("click", () => abrir_modal_adicionar_post_curso(objeto_post));
        autor_dados.appendChild(botaoAdicionarCurso);

        if (objeto_post.tipo === "atividade") {
            const botaoAdicionarProva = document.createElement("button");
            botaoAdicionarProva.type = "button";
            botaoAdicionarProva.classList.add("botao_adicionar_post_curso");
            botaoAdicionarProva.innerText = "Adicionar a prova";
            botaoAdicionarProva.addEventListener("click", () => abrir_modal_adicionar_atividade_prova(objeto_post));
            autor_dados.appendChild(botaoAdicionarProva);
        }
    }
    return post;
}

async function botao_salvar_curso(container_autor, curso){
    const usuario_atual = JSON.parse(localStorage.getItem("usuario") ?? "{}");
    const meus_cursos = await buscar_cursos_usuario();
    const curso_id = Number(curso.id);
    const origem_curso_id = Number(curso.origem_curso_id ?? curso.id);
    const curso_do_usuario = Number(curso.usuario_id) === Number(usuario_atual.id) || curso.proprietario === true;
    const curso_copiado = meus_cursos.find(item => {
        const item_id = Number(item.id);
        const item_origem = Number(item.origem_curso_id ?? item.id);
        return item_id === curso_id || item_origem === origem_curso_id;
    });
    const ja_salvo = curso_do_usuario || Boolean(curso_copiado) || curso.curso_salvo === true;

    const botao = document.createElement("button");
    botao.setAttribute("type", "button");
    botao.classList.add(ja_salvo ? "botao_desfavoritar_curso" : "botao_favoritar_curso");
    botao.innerText = curso_do_usuario ? "Abrir curso" : ja_salvo ? "Curso salvo" : "Salvar curso";

    container_autor.appendChild(botao);

    botao.addEventListener("click", async () => {
        if (curso_do_usuario || curso_copiado) {
            const id_para_abrir = curso_copiado?.id ?? curso.id;
            history.pushState(null, null, `/Post/${id_para_abrir}`);
            const { routes } = await import("/js/app/router.js");
            await routes.executar();
            return;
        }

        botao.disabled = true;
        botao.innerText = "Salvando...";

        try {
            const resposta = await api_fetch("/curso/salvar", {
                method: "POST",
                body: { curso_id }
            });
            const curso_salvo = extrair_mensagem(resposta);
            botao.classList.remove("botao_favoritar_curso");
            botao.classList.add("botao_desfavoritar_curso");
            botao.innerText = "Curso salvo";
            botao.disabled = false;
            window.dispatchEvent(new CustomEvent("knowledgehub:cursosAtualizados", { detail: { curso: curso_salvo } }));
        } catch (erro) {
            console.error(erro);
            botao.disabled = false;
            botao.innerText = "Salvar curso";
            alert(erro.message);
        }
    });
}

async function abrir_modal_adicionar_post_curso(post){
    fechar_modal_curso_post();

    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay");
    overlay.id = "modal_adicionar_post_curso";

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_post_curso");

    const titulo = document.createElement("h2");
    titulo.innerText = "Adicionar post a curso";
    const texto = document.createElement("p");
    texto.classList.add("texto_modal_categoria_feed");
    texto.innerText = `Escolha um curso para receber: ${post.titulo ?? 'post sem título'}.`;

    const lista = document.createElement("div");
    lista.classList.add("lista_cursos_modal");

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const form = document.createElement("form");
    form.classList.add("form_criar_curso_rapido");
    const inputTitulo = document.createElement("input");
    inputTitulo.type = "text";
    inputTitulo.placeholder = "Criar novo curso, ex: Curso de JavaScript";
    inputTitulo.maxLength = 200;
    const botaoCriar = document.createElement("button");
    botaoCriar.type = "submit";
    botaoCriar.innerText = "Criar curso e adicionar";
    form.append(inputTitulo, botaoCriar);

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.classList.add("botao_cancelar_feed");
    fechar.innerText = "Fechar";
    fechar.addEventListener("click", fechar_modal_curso_post);
    acoes.appendChild(fechar);

    modal.append(titulo, texto, lista, form, mensagem, acoes);
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
            mensagem.innerText = "Curso criado e post adicionado.";
            fechar_modal_curso_post();
        } catch (erro) {
            mensagem.innerText = erro.message;
            botaoCriar.disabled = false;
            botaoCriar.innerText = "Criar curso e adicionar";
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
                mensagem.innerText = "Post adicionado ao curso.";
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

async function votar(container, voto_clicado){
    const voto_atual = Number(container.dataset.votoUsuario ?? 0);
    const novo_voto = voto_atual === voto_clicado ? 0 : voto_clicado;
    const pontos = container.querySelector(".pontos_genero");

    try {
        await api_fetch("/post/vote", {
            method: "PUT",
            body: {
                post_id: Number(container.dataset.postId),
                categoria_id: Number(container.dataset.categoriaId),
                voto: novo_voto
            }
        });

        pontos.innerText = Number(pontos.innerText) + (novo_voto - voto_atual);
        atualizar_estado_voto(container, novo_voto);
    } catch (erro) {
        console.error(erro);
    }
}

function atualizar_estado_voto(container, voto){
    container.dataset.votoUsuario = voto;
    const up_vote = container.querySelector(".up_vote");
    const down_vote = container.querySelector(".down_vote");
    up_vote.classList.toggle("up_vote_checked", voto === 1);
    down_vote.classList.toggle("down_vote_checked", voto === -1);
}


async function abrir_modal_adicionar_atividade_prova(atividade){
    fechar_modal_prova();

    const overlay = document.createElement("div");
    overlay.classList.add("modal_feed_overlay");
    overlay.id = "modal_adicionar_atividade_prova";

    const modal = document.createElement("section");
    modal.classList.add("modal_feed", "modal_post_curso");

    const titulo = document.createElement("h2");
    titulo.innerText = "Adicionar atividade à prova";

    const texto = document.createElement("p");
    texto.classList.add("texto_modal_categoria_feed");
    texto.innerText = `Escolha uma prova para receber: ${atividade.titulo ?? 'atividade sem título'}.`;

    const lista = document.createElement("div");
    lista.classList.add("lista_cursos_modal");
    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_feed");

    const form = document.createElement("form");
    form.classList.add("form_criar_curso_rapido");
    const inputTitulo = document.createElement("input");
    inputTitulo.type = "text";
    inputTitulo.placeholder = "Criar nova prova";
    inputTitulo.maxLength = 200;
    const botaoCriar = document.createElement("button");
    botaoCriar.type = "submit";
    botaoCriar.innerText = "Criar prova e adicionar";
    form.append(inputTitulo, botaoCriar);

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_feed");
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.classList.add("botao_cancelar_feed");
    fechar.innerText = "Fechar";
    fechar.addEventListener("click", fechar_modal_prova);
    acoes.appendChild(fechar);

    modal.append(titulo, texto, lista, form, mensagem, acoes);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", evento => { if (evento.target === overlay) fechar_modal_prova(); });

    try {
        const provas = await buscar_provas_usuario();
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
            await api_fetch("/prova/add", {
                method: "POST",
                body: {
                    titulo: tituloProva,
                    descricao: `Prova criada a partir da atividade: ${atividade.titulo ?? ''}`,
                    categorias,
                    atividades: [Number(atividade.id)]
                }
            });
            fechar_modal_prova();
        } catch (erro) {
            mensagem.innerText = erro.message;
            botaoCriar.disabled = false;
            botaoCriar.innerText = "Criar prova e adicionar";
        }
    });
}

async function buscar_provas_usuario(){
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

function fechar_modal_prova(){
    document.getElementById("modal_adicionar_atividade_prova")?.remove();
}

function calcular_tempo(tempo){
    if (!tempo) return "";
    const agora = new Date();
    const postado_em = new Date(tempo);
    const diferenca = agora - postado_em;
    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const anos = Math.floor(dias / 365);
    if(anos > 0){return `${anos} anos atrás`;}
    if(dias > 0){return `${dias} dias atrás`;}
    if(horas > 0){return `${horas} horas atrás`;}
    if(minutos > 0){return `${minutos} minutos atrás`;}
    return `${Math.max(segundos, 0)} segundos atrás`;
}
