import { api_fetch, extrair_mensagem } from "/js/app/api.js";
import { routes } from "/js/app/router.js";

export function load_cadastro_page(param){
    const botao_login = document.getElementById("derecionar_login");
    botao_login?.addEventListener("click", async () => {
        history.pushState(null, null, "/Login");
        await routes.executar();
    });

    const sessao = document.getElementById("cadastro_sessao");
    sessao.innerHTML = `
        <p class="cadastro_etiqueta">Cadastro</p>
        <h2>Criar conta</h2>
        <p class="cadastro_subtitulo">Entre no KnowledgeHub para salvar cursos, feeds e categorias.</p>
        <form id="formulario_de_cadastro">
            <label for="cadastro_nome">Nome</label>
            <input id="cadastro_nome" name="nome" type="text" autocomplete="name" required>
            <label for="cadastro_email">Email</label>
            <input id="cadastro_email" name="email" type="email" autocomplete="email" required>
            <label for="cadastro_senha">Senha</label>
            <input id="cadastro_senha" name="senha" type="password" autocomplete="new-password" required>
            <p id="mensagem_de_cadastro" aria-live="polite"></p>
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
