import {routes} from "/js/app/router.js";
import { api_fetch, extrair_mensagem, normalizar_usuario } from "/js/app/api.js";

export async function load_login_page(param){
    const form_login = document.getElementById("formulario_de_login");
    form_login.addEventListener("submit", evento => buscar_usuario(evento));

    const input_checkbox = document.getElementById("mostrar-senha")
    input_checkbox.addEventListener("click", evento => mostrar_senha(evento))

    const link_cadastro = document.getElementById("link_cadastro");
    link_cadastro?.addEventListener("click", async (evento) => {
        evento.preventDefault();
        history.pushState(null, null, "/Cadastre-se");
        await routes.executar();
    });
}

async function buscar_usuario(evento){
    evento.preventDefault();
    const formulario = evento.target;
    const senha = formulario.usuario_senha.value;
    const email = formulario.usuario_email.value;
    const mensagem_erro = document.getElementById("mensagem_de_erro");
    mensagem_erro.textContent = "";

    try {
        const dados = await api_fetch("/auth/login", {
            method:"POST",
            auth: false,
            body: { email, senha }
        });

        const resposta = extrair_mensagem(dados);
        const token = typeof resposta === "string" ? resposta : resposta.token;
        const usuario = typeof resposta === "object" ? resposta.usuario : null;

        if (!token) throw new Error("A API não retornou token.");

        localStorage.setItem("token", token);

        if (usuario) {
            localStorage.setItem("usuario", JSON.stringify(normalizar_usuario(usuario)));
        } else {
            const dados_usuario = await api_fetch("/auth/me");
            localStorage.setItem("usuario", JSON.stringify(normalizar_usuario(extrair_mensagem(dados_usuario))));
        }

        history.pushState(null,null,"/Home")
        await routes.executar();
    } catch (erro) {
        mensagem_erro.textContent = erro.message;
    }
}

function mostrar_senha(evento){
    const checkbox = evento.target;
    const input_senha = document.getElementById("usuario_senha")
    if(checkbox.checked)input_senha.type = "text"
    if(!checkbox.checked)input_senha.type = "password"
}
