import { api_fetch, extrair_lista } from "/js/app/api.js";

export async function carregar_feed(){
    const feeds = await carregar_feeds()
    carregar_header_feed(feeds)
}

function carregar_header_feed(feeds){
    const header_feeds = document.getElementById("header_feed")
    if (!header_feeds) return;
    feeds.forEach(feed => {
        const item_header_feed = document.createElement("button")
        item_header_feed.classList.add("item_header_feed")
        item_header_feed.innerText = feed.titulo
        item_header_feed.setAttribute("feed-id",feed.id)
        item_header_feed.type = "button";
        header_feeds.appendChild(item_header_feed)
    })
}

async function carregar_feeds(){
    const dados = await api_fetch("/feed")
    return extrair_lista(dados, ["feeds"]);
}
