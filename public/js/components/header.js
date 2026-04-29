export function render_header(user){
    return  `<header class="header">
        <nav class="header_nav">
            <button class="btn_header btn_menu" aria_label="Menu">☰</button>
            <button class="btn_header btn_home">Home</button>
        </nav>

        <form class="header_search" action="#">
            <input class="search_input" type="text" placeholder="Pesquisar...">
            <button class="btn_header btn_search" type="submit">Pesquisar</button>
            <button class="btn_header btn_filter" type="button">Filtrar</button>
        </form>

        <div class="header_user">
            <span class="user_name">${user.nome}</span>
            <img class="user_avatar" src="${user.img}" alt="Avatar do usuário">
        </div>
    </header>`;

}