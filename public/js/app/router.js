import { pages } from '/js/pages/registro_paginas.js'
const root = document.getElementById('root');    

async function load_html_page(name_page_html){
    const response = await fetch(`/pages/${name_page_html}.html`);
    const data = await response.text();
    root.innerHTML = data;
}
function load_css_page(CSSs){
    const CSSs_antigos = document.querySelectorAll(".pagina_css");
    CSSs_antigos.forEach(css => css.remove());
    const head = document.querySelector("head");

    const pagina_css = document.createElement("link")
    pagina_css.classList.add("pagina_css");
    pagina_css.rel = "stylesheet";
    pagina_css.href = `/css/page/${CSSs.page}.css`;
    head.appendChild(pagina_css);
    
    CSSs.components.forEach((value, index) => {
        const componente_css = document.createElement("link")
        componente_css.classList.add("pagina_css")
        componente_css.rel = "stylesheet";
        componente_css.href = `/css/components/${value}.css`;
        head.appendChild(componente_css);
    })
}
async function load_func_page(page, param){
    const dados_pagina = pages[page];
    load_css_page(dados_pagina.css);
    await load_html_page(page);
    dados_pagina.func(param);
}

class Rotas {
    rotas = [];
    constructor(){
        this.rotas = [
            {regex : /^\/Home$/, page: "home"}, 
            {regex : /^\/Login$/, page: "login"}, 
            {regex : /^\/Cadastre-se$/, page: "cadastro"},
        ]
    }
    
    async executar(){
        const url = window.location.pathname
        const url_formatada = decodeURIComponent(url);
        for (const route of this.rotas) {
            if(route.regex.test(url_formatada)){
                const params = url_formatada.match(route.regex)
                await load_func_page(route.page, params);
                return;
            }
        }

        history.pushState(null,null,"/Login");
        await load_func_page('login',null);
    }
}
export const routes = new Rotas();
window.addEventListener('popstate', () =>  routes.executar());
window.addEventListener("load", () =>  routes.executar());
window.addEventListener("keydown", async (evento) => {
    if(evento.key === "i" && evento.ctrlKey){
        localStorage.clear();
        history.pushState(null,null,"Login");
        await routes.executar();
    }
})