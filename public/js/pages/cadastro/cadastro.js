import { api_fetch, extrair_mensagem } from "/js/app/api.js";
import { routes } from "/js/app/router.js";

export function load_cadastro_page(param){
    const sessao = document.getElementById("cadastro_sessao");
    sessao.innerHTML = `
        <h2>Criar conta</h2>
        <form id="formulario_de_cadastro">
            <label>Nome</label>
            <input name="nome" type="text" required>
            <label>Email</label>
            <input name="email" type="email" required>
            <label>Senha</label>
            <input name="senha" type="password" required>
            <p id="mensagem_de_cadastro"></p>
            <button class="botao_padrao" type="submit">Cadastrar</button>
        </form>
    `;

    document.getElementById("formulario_de_cadastro").addEventListener("submit", criar_conta);
}

async function criar_conta(evento) {
    evento.preventDefault();
    const form = evento.target;
    const mensagem = document.getElementById("mensagem_de_cadastro");
    mensagem.textContent = "";

    try {
        const dados = await api_fetch("/auth/criarConta", {
            method: "POST",
            auth: false,
            body: {
                nome: form.nome.value,
                email: form.email.value,
                senha: form.senha.value
            }
        });
        mensagem.textContent = "Conta criada. Agora faça login.";
        setTimeout(async () => {
            history.pushState(null, null, "/Login");
            await routes.executar();
        }, 700);
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}
