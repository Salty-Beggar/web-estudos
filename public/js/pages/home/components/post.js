import { api_fetch } from "/js/app/api.js";

export function criar_post(objeto_post){
    const post = document.createElement("div")
    const autor_dados = document.createElement("div")
    const img_autor = document.createElement("img")
    const nome_autor = document.createElement("p")
    console.log(objeto_post)

    post.classList.add("post_container")
    autor_dados.classList.add("autor_dados")
    img_autor.classList.add("img_autor")
    nome_autor.classList.add("nome_autor")

    const post_dados = document.createElement("div")
    const titulo_post = document.createElement("h2")
    const tipo_post = document.createElement("p")
    const descricao_post = document.createElement("p")
    const postado_quando_post = document.createElement("p")
    const generos_post = document.createElement("div")

    post_dados.classList.add("post_dados")
    titulo_post.classList.add("titulo_post")
    tipo_post.classList.add("tipo_post")
    descricao_post.classList.add("descricao_post")
    postado_quando_post.classList.add("postado_quando_post")
    generos_post.classList.add("generos_post")

    post.appendChild(autor_dados)
    post.appendChild(post_dados)

    autor_dados.appendChild(img_autor)
    autor_dados.appendChild(nome_autor)

    post_dados.appendChild(titulo_post)
    post_dados.appendChild(tipo_post)
    post_dados.appendChild(descricao_post)
    post_dados.appendChild(postado_quando_post)
    post_dados.appendChild(generos_post)

    const autor = objeto_post.autor ?? {};
    img_autor.src = autor.img ?? "/assets/imgs/users/guest_user.svg"
    img_autor.onerror = () => { img_autor.src = "/assets/imgs/users/guest_user.svg"; }
    nome_autor.innerText = autor.nome ?? "Usuário"

    titulo_post.innerText = objeto_post.titulo ?? "Sem título"
    tipo_post.innerText = objeto_post.tipo ?? "post"
    descricao_post.innerText = objeto_post.descricao ?? ""
    postado_quando_post.innerText = calcular_tempo(objeto_post.data_criacao)
    
    titulo_post.addEventListener("click", async () => {
        history.pushState(null, null, `/Post/${objeto_post.id}`)
        const { routes } = await import("/js/app/router.js")
        routes.executar()
    })
    
    const generos = Array.isArray(objeto_post.generos) ? objeto_post.generos : [];
    generos.forEach(genero => {
        const genero_container = document.createElement("div")
        genero_container.classList.add("genero_container")
        genero_container.dataset.categoriaId = genero.id;
        genero_container.dataset.postId = objeto_post.id;
        genero_container.dataset.votoUsuario = genero.voto_usuario ?? 0;

        const nome_genero = document.createElement("p")
        nome_genero.classList.add("nome_genero")
        const pontos_genero = document.createElement("p")
        pontos_genero.classList.add("pontos_genero")
        const up_vote = document.createElement("button")
        up_vote.classList.add("up_vote")
        const down_vote = document.createElement("button")
        down_vote.classList.add("down_vote")

        generos_post.appendChild(genero_container)
        genero_container.appendChild(nome_genero)
        genero_container.appendChild(pontos_genero)
        genero_container.appendChild(up_vote)
        genero_container.appendChild(down_vote)

        nome_genero.innerText = genero.genero
        pontos_genero.innerText = genero.pontos
        up_vote.innerText = "UP"
        down_vote.innerText = "DOWN"
        up_vote.setAttribute("type", "button")
        down_vote.setAttribute("type", "button")

        atualizar_estado_voto(genero_container, Number(genero.voto_usuario ?? 0));
        up_vote.addEventListener("click", () => votar(genero_container, 1));
        down_vote.addEventListener("click", () => votar(genero_container, -1));
    })
   
    if(objeto_post.tipo == "curso"){
        botao_favoritar_curso(autor_dados, objeto_post.id)
    } else {
        // botao_adicionar_a_curso()
    }
    return post
}

async function cursos_favoritados_usuario(){
    const token = localStorage.getItem("token");
    const resposta = await api_fetch("/cursos", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
         }
    })
    if(resposta.success){
        const cursos = resposta.mensagem.cursos ?? [];
        return cursos;
    }else{
        console.error("Erro ao buscar cursos favoritados:", resposta.mensagem);
        return [];
    }
}

async function botao_favoritar_curso(container_autor, curso_id){
    const cursos_favoritados = await cursos_favoritados_usuario();
    // console.log("Cursos favoritados pelo usuário:", cursos_favoritados);
    const botao_favoritar = document.createElement("button")
    if(cursos_favoritados.some(curso => curso.id === curso_id)){
        botao_favoritar.innerText = "Desfavoritar Curso"
        botao_favoritar.classList.add("botao_desfavoritar_curso")
        botao_favoritar.disabled = true
    } else {
        botao_favoritar.classList.add("botao_favoritar_curso")
        botao_favoritar.innerText = "Favoritar Curso"
    }
    botao_favoritar.setAttribute("type", "button")
    container_autor.appendChild(botao_favoritar)
    botao_favoritar.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        const resposta = await api_fetch("/curso/favoritar", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
             },
            body: {
                curso_id: curso_id
            }
        })
        window.location.reload()
    })
    // window.reload()

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
    const up_vote = container.querySelector(".up_vote")
    const down_vote = container.querySelector(".down_vote")
    up_vote.classList.toggle("up_vote_checked", voto === 1);
    down_vote.classList.toggle("down_vote_checked", voto === -1);
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
    if(anos > 0){return `${anos} anos atrás`}
    if(dias > 0){return `${dias} dias atrás`}
    if(horas > 0){return `${horas} horas atrás`}
    if(minutos > 0){return `${minutos} minutos atrás`}
    return `${Math.max(segundos, 0)} segundos atrás`
}
