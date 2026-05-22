import { renderizar_barra_lateral } from '/js/pages/home/components/sidebar.js';
import { renderizar_cabecalho } from '/js/components/header.js';
import { get_current_user } from '/js/app/usuario_atual.js';
import { criar_post } from '/js/pages/home/components/post.js';
import { criar_filtro } from '/js/pages/home/components/filtro.js';
import '/js/app/usuario_atual.js';

export async function load_home_page(param){
    await renderizar_barra_lateral()
    renderizar_cabecalho()
    criar_filtro()
    // carregar_feed()//carrega o feed e o header do feed
    trocar_barra_lateral();
    await carregar_conteudo()
    await carregar_feed_header()
}


function trocar_barra_lateral(){
    const botao_menu = document.getElementById("botao_menu");
    botao_menu.addEventListener("click", () => {
        const barra_lateral = document.getElementById("barra_lateral");
        const root = document.getElementById("root");
        root.classList.toggle("barra_lateral_fechada");
    });
}


async function carregar_conteudo(){
    const corpo = document.getElementById("corpo_feed")

    const posts = await buscar_posts();
    if(posts.length === 0){
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhum post encontrado.";
        corpo.appendChild(mensagem);
    }else{
        posts.forEach(post => {
            const post_elemento = criar_post(post)//sera um item html
            corpo.appendChild(post_elemento)
        })
    }
}


async function buscar_posts(){
    const resposta = await fetch("http://localhost:3000/posts",{ method:"GET"});
    const dados = await resposta.json();
    return dados ?? [];
} 

async function carregar_feed_header(){
    const feeds = await carregar_feeds()
    if(!feeds){
        console.log("sem feed")
    }else{
        const header_feeds = document.getElementById("header_feed")
        feeds.forEach(feed => {
            const item_header_feed = document.createElement("button")
            item_header_feed.classList.add("item_header_feed")
            item_header_feed.innerText = feed.titulo
            item_header_feed.setAttribute("feed-id",feed.id)
            header_feeds.appendChild(item_header_feed)

            if(feed.ultimo_feed_ativo){
                item_header_feed.classList.add("ativo")
                const filtro_container = document.getElementById("filtro_container")

                const titulo = document.createElement("h1")
                titulo.innerText = feed.titulo
                filtro_container.appendChild(titulo)
            }
            header_feeds.addEventListener("click", (evento) => {
                const item_clicado = evento.target.closest(".item_header_feed")
                const antigo_clicado = header_feeds.querySelector(".item_header_feed.ativo")
                if(antigo_clicado)antigo_clicado.classList.remove("ativo")
                if(item_clicado)item_clicado.classList.add("ativo")
                
            })
        });
    }

}

async function carregar_feeds(){
    const resposta = await fetch("http://localhost:3000/feeds",{ method: "GET"})
    const dados = await resposta.json()
    // console.log(dados)
    if(!dados.sucesso) return []
    return dados.feeds
}


// function trocar_feed(){
//     const barra_feed = document.getElementById("header_feed")
//     barra_feed.addEventListener("click", (evento) => {
//         const item_clicado = evento.target.closest(".item_header_feed")
//         const antigo_clicado = barra_feed.querySelector(".item_header_feed.ativo")
        
//         if(antigo_clicado)antigo_clicado.classList.remove("ativo")
//         if(item_clicado)item_clicado.classList.add("ativo")

        
//     })
// }