import { render_barra_lateral } from '/js/components/sidebar.js';
import { renderizar_cabecalho } from '/js/components/header.js';
import { get_current_user } from '/js/app/usuario_atual.js';
import '/js/app/usuario_atual.js';

export async function load_home_page(param){
    const usuario = get_current_user();
    const header = document.createElement('header');
    const sidebar = await render_barra_lateral()
    header.innerHTML = renderizar_cabecalho(usuario);
    root.appendChild(sidebar)
    root.appendChild(header);
    trocar_barra_lateral();
    
}
function trocar_barra_lateral(){
    const botao_menu = document.getElementById("botao_menu");
    botao_menu.addEventListener("click", () => {
        const barra_lateral = document.getElementById("barra_lateral");
        const root = document.getElementById("root");
        root.classList.toggle("barra_lateral_fechada");
    });
}