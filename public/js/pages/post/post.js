export async function load_post_page(param) {
    const id = param[1]; 
    const dados_post = await buscar_dados_post(id);

    const root = document.getElementById("root");
    root.appendChild(criar_post_base(dados_post))
    
}

async function buscar_dados_post(id_post){
    const resposta = await fetch(`http://localhost:3000/posts/${id_post}`,{ method:"GET"});
    const dados = await resposta.json();
    if(dados.sucesso){
        return dados.post
    }
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

    img_autor.src = dados_post.autor.img
    nome_autor.innerText = dados_post.autor.nome

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

    titulo_post.innerText = dados_post.titulo
    tipo_post.innerText = dados_post.tipo
    descricao_post.innerText = dados_post.descricao
    postado_quando_post.innerText = dados_post.data_criacao

    dados_post.generos.forEach(genero => {
        const genero_container = document.createElement("div")
        genero_container.classList.add("genero_container")

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
        genero_container.addEventListener("click", async (evento) => clique_no_voto(evento, genero_container))
    
    })
    return post_container
}

async function clique_no_voto(evento, genero_container) {
    // Lógica para lidar com o clique no voto
}