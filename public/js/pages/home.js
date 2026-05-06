import { render_barra_lateral } from '/js/components/sidebar.js';
import { renderizar_cabecalho } from '/js/components/header.js';
import { get_current_user } from '/js/app/usuario_atual.js';
import { criar_post } from '/js/components/post.js';
import { criar_filtro } from '/js/components/filtro.js';
import '/js/app/usuario_atual.js';

export async function load_home_page(param){
    const usuario = get_current_user();
    const header = document.createElement('header');
    const sidebar = await render_barra_lateral()
    const filtro = await criar_filtro()
    console.log(filtro)
    header.innerHTML = renderizar_cabecalho(usuario);
    root.appendChild(sidebar)
    root.appendChild(filtro)
    root.appendChild(header);
    trocar_barra_lateral();
    await carregar_conteudo()
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