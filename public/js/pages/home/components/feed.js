// import { carregar_filtro_feed } from '/js/pages/home/components/filtro.js';

export async function carregar_feed(){
    const feeds = await carregar_feeds()
    carregar_header_feed(feeds)
}

function carregar_header_feed(feeds){
    const header_feeds = document.getElementById("header_feed")
    feeds.forEach(feed => {
        const item_header_feed = document.createElement("button")
        item_header_feed.classList.add("item_header_feed")
        item_header_feed.innerText = feed.titulo
        item_header_feed.setAttribute("feed-id",feed.id)
        header_feeds.appendChild(item_header_feed)
    })
    header_feeds.addEventListener("click", (evento) => {
        const item_clicado = evento.target.closest(".item_header_feed")
        const antigo_clicado = header_feeds.querySelector(".item_header_feed.ativo")
        if(antigo_clicado)antigo_clicado.classList.remove("ativo")
        if(item_clicado)item_clicado.classList.add("ativo")
        carregar_conteudo_feed(feeds)
            // carregar_filtro_feed(feeds)
    })
    carregar_conteudo_feed(feeds)
}

function carregar_conteudo_feed(feeds){
    const header_feeds = document.getElementById("header_feed")
    const feed_ativo = header_feeds.querySelector(".item_header_feed.ativo")
    if(feed_ativo){
        const feed_id = feed_ativo.getAttribute("feed-id")
    }
}

// function carregar_header_feed(feeds){
//     const header_feeds = document.getElementById("header_feed")
//     feeds.forEach(feed => {
//         const item_header_feed = document.createElement("button")
//         item_header_feed.classList.add("item_header_feed")
//         item_header_feed.innerText = feed.titulo
//         item_header_feed.setAttribute("feed-id",feed.id)
//         header_feeds.appendChild(item_header_feed)
//     })
//     header_feeds.addEventListener("click", (evento) => {
//         const item_clicado = evento.target.closest(".item_header_feed")
//         const antigo_clicado = header_feeds.querySelector(".item_header_feed.ativo")
//         if(antigo_clicado)antigo_clicado.classList.remove("ativo")
//         if(item_clicado)item_clicado.classList.add("ativo")
//     })

// }

async function carregar_feeds(){
    const resposta = await fetch("http://localhost:3000/feeds",{ method: "GET"})
    const dados = await resposta.json()
    if(!dados.sucesso) return []
    return dados.feeds
}
