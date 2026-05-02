export function renderizar_cabecalho(user){
    return  `
        <nav class="cabecalho_navegacao">
            <button class="botao_cabecalho" id="botao_menu" aria_label="Menu">☰</button>
            <button class="botao_cabecalho botao_home">Home</button>
        </nav>

        <form class="cabecalho_pesquisa" action="#">
            <input class="input_pesquisa" type="text" placeholder="Pesquisar...">
            <button class="botao_cabecalho botao_pesquisa" type="submit">Pesquisar</button>
            <button class="botao_cabecalho botao_filtro" type="button">Filtrar</button>
        </form>

        <div class="cabecalho_usuario">
            <span class="nome_usuario">${user.nome}</span>
            <img class="avatar_usuario" src="${user.img}" alt="Avatar do usuário">
        </div>`;

}