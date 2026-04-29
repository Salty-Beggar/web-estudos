import {routes} from "/KnowledgeHub/public/js/app/router.js";

export async function load_login_page(param){
    const form_login = document.getElementById("formulario_de_login");
    form_login.addEventListener("submit", evento => buscar_usuario(evento));

    const input_checkbox = document.getElementById("mostrar-senha")
    input_checkbox.addEventListener("click", evento => mostrar_senha(evento))
}

async function buscar_usuario(evento){//nao foi verificada ainda e nao esta funcionando por enquanto ent n corrija
    evento.preventDefault();
    const formulario = evento.target;
    const senha = formulario.usuario_senha.value;
    const email = formulario.usuario_email.value;
    const resposta = await fetch("http://localhost:3000/backend_merda/usuario",{ //isso esta comentado por que ainda nao ha backend ent so causaria erro deixar assim sera usado um json por enquanto
        method:"POST",headers: {"Content-Type":"application/json"},body: JSON.stringify({email, senha})
    })
    
    const dados = await resposta.json();
    if(dados.sucesso){
        const usuario = JSON.stringify(dados.usuario);
        localStorage.setItem("token",dados.token);
        localStorage.setItem("usuario",usuario);
        history.pushState(null,null,"Home")
        await routes.executar();
    }else{
        const mensagem_erro = document.getElementById("mensagem_de_erro");
        mensagem_erro.textContent = dados.message;
    }
}

function mostrar_senha(evento){
    const checkbox = evento.target;
    const input_senha = document.getElementById("usuario_senha")
    if(checkbox.checked)input_senha.type = "text"
    if(!checkbox.checked)input_senha.type = "password"
}