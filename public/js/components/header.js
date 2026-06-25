import { get_current_user } from "/js/app/usuario_atual.js";
import { routes } from "/js/app/router.js";

export function renderizar_cabecalho(){
    const root = document.getElementById("root");
    const cabecalho = document.createElement("header")
    const navegacao = document.createElement("nav")
    const pesquisas = document.createElement("form")
    const usuario_cabecalho = document.createElement("div")
    const usuario = get_current_user();

    cabecalho.appendChild(navegacao)
    cabecalho.appendChild(pesquisas)
    cabecalho.appendChild(usuario_cabecalho)

    navegacao.classList.add("cabecalho_navegacao")
    pesquisas.classList.add("cabecalho_pesquisa")
    usuario_cabecalho.classList.add("cabecalho_usuario")

    const botao_menu = document.createElement("button")
    botao_menu.classList.add("botao_cabecalho")
    botao_menu.setAttribute("id","botao_menu")
    botao_menu.setAttribute("type","button")
    navegacao.appendChild(botao_menu)
    botao_menu.innerText = "Menu"

    const botao_Home = document.createElement("button")
    botao_Home.classList.add("botao_cabecalho")
    botao_Home.classList.add("botao_home")
    botao_Home.setAttribute("type","button")
    navegacao.appendChild(botao_Home)
    botao_Home.innerText = "Home"
    botao_Home.addEventListener("click", async () => {
        history.pushState(null, null, "/Home");
        await routes.executar();
    });

    const input_pesquisa = document.createElement("input")
    input_pesquisa.classList.add("input_pesquisa")
    input_pesquisa.setAttribute("type","text")
    input_pesquisa.setAttribute("placeholder","Pesquisar...")
    pesquisas.appendChild(input_pesquisa)

    const botao_pesquisa = document.createElement("button")
    botao_pesquisa.classList.add("botao_cabecalho")
    botao_pesquisa.classList.add("botao_pesquisa")
    botao_pesquisa.setAttribute("type","submit")
    botao_pesquisa.innerText = "Pesquisar"
    pesquisas.appendChild(botao_pesquisa)

    const botao_filtro = document.createElement("button")
    botao_filtro.classList.add("botao_cabecalho")
    botao_filtro.classList.add("botao_filtro")
    botao_filtro.setAttribute("type","button")
    botao_filtro.innerText = "Filtrar"
    pesquisas.appendChild(botao_filtro)

    pesquisas.addEventListener("submit", (evento) => {
        evento.preventDefault();
        window.dispatchEvent(new CustomEvent("knowledgehub:pesquisar", {
            detail: { pesquisa: input_pesquisa.value }
        }));
    });

    const nome_usuario = document.createElement("span")
    nome_usuario.classList.add("nome_usuario")
    nome_usuario.innerText = usuario.nome
    usuario_cabecalho.appendChild(nome_usuario)

    const avatar_usuario = document.createElement("img")
    avatar_usuario.classList.add("avatar_usuario")
    avatar_usuario.setAttribute("src", usuario.img)
    avatar_usuario.onerror = () => { avatar_usuario.src = "/assets/imgs/users/guest_user.svg"; }
    avatar_usuario.setAttribute("alt", "Avatar do usuário")
    usuario_cabecalho.appendChild(avatar_usuario)

    root.appendChild(cabecalho)
}
