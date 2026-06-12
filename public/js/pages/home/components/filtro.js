export function criar_filtro(){
    const filtro_container = document.createElement("section")
    filtro_container.setAttribute("id","filtro_container")
    root.appendChild(filtro_container)

    const titulo = document.createElement("h2")
    titulo.setAttribute("id","feed_titulo")
    filtro_container.appendChild(titulo)

    const descricao = document.createElement("p")
    descricao.setAttribute("id","feed_descricao")
    filtro_container.appendChild(descricao)
}

export function carregar_feed_filtro(feed){
    const section_generos_antiga = document.getElementById("section_generos")
    if(section_generos_antiga){
        section_generos_antiga.remove()
    }
    const filtro_container = document.getElementById("filtro_container")
    const section_generos = document.createElement("section")
    section_generos.setAttribute("id","section_generos")
    filtro_container.appendChild(section_generos)

    const descricao = document.getElementById("feed_descricao")
    const titulo = document.getElementById('feed_titulo')

    titulo.innerText = feed.titulo
    descricao.innerText = feed.descricao
    
    feed.generos.forEach(genero => {
        const button = document.createElement("button")
        button.innerText = genero
        section_generos.appendChild(button)
        button.addEventListener('click',(evento) => {
            const genero_formatado = genero.toLowerCase()
                .replace(/\s/g, "_")
                .replace(/\//g, "-")
            history.pushState(null,null,`/generos/${genero_formatado}`)
        })
    })
}