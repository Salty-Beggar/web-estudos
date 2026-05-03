export function criar_post(objeto_post){
    console.log(objeto_post)
    const post = document.createElement("div")//nome foto cargo
    post.classList.add("post_container")
    const autor_dados = document.createElement("div")//nome foto cargo
    autor_dados.classList.add("autor_dados")
    const img_autor = document.createElement("img")
    img_autor.classList.add("img_autor")
    const nome_autor = document.createElement("p")
    nome_autor.classList.add("nome_autor")

    const post_dados = document.createElement("div")
    post_dados.classList.add("post_dados")
    const titulo_post = document.createElement("h2")
    titulo_post.classList.add("titulo_post")
    const tipo_post = document.createElement("p")
    tipo_post.classList.add("tipo_post")
    const descricao_post = document.createElement("p")
    descricao_post.classList.add("descricao_post")
    const postado_quando_post = document.createElement("p")
    postado_quando_post.classList.add("postado_quando_post")
    const generos_post = document.createElement("div")
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

    img_autor.src = objeto_post.autor.img
    nome_autor.innerText = objeto_post.autor.nome

    titulo_post.innerText = objeto_post.titulo
    tipo_post.innerText = objeto_post.tipo
    descricao_post.innerText = objeto_post.descricao
    postado_quando_post.innerText = calcular_tempo(objeto_post.data_criacao)//quano tempo desde o post
    objeto_post.generos.forEach(genero => {
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
    })
    return post
}
function calcular_tempo(tempo){//nao fiz essa porra, peguei na internet, se quiserem melhorar fiquem a vontade
    const agora = new Date();
    const postado_em = new Date(tempo);
    const diferenca = agora - postado_em;
    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const anos = Math.floor(dias / 365);
    if(anos > 0){return `${anos} anos atrás`
    }
    if(dias > 0){return `${dias} dias atrás`
    }
    if(horas > 0){return `${horas} horas atrás`
    }
    if(minutos > 0){return `${minutos} minutos atrás`
    }
    return `${segundos} segundos atrás`
}