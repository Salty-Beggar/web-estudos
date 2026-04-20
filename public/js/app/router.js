import { load_home_page } from "/KnowledgeHub/public/js/pages/home.js"; 
const root = document.getElementById('root');    

async function load_html_page(name_page_html){
    const response = await fetch(`/KnowledgeHub/public/pages/${name_page_html}.html`);
    const data = await response.text();
    root.innerHTML = data;
}

function load_css_page(name_page_css){
    const old_css = document.getElementById('cssPage');
    if(old_css) old_css.remove();
    const head = document.querySelector("head");
    const new_css = document.createElement("link");
    new_css.id = 'cssPage';
    new_css.rel = "stylesheet";
    new_css.href = `/KnowledgeHub/public/css/${name_page_css}.css`;
    head.appendChild(new_css);
}
// console.log("oi")
async function load_func_page(page, param){
    const relations = {
        home : {
            css: (page) => load_css_page(page), 
            html: (page) => load_html_page(page), 
            func: (param) => load_home_page(param)
        }
    }
    const data_page = relations[page];
    data_page.css(page);
    await data_page.html(page);
    data_page.func(param);
}

class Rotas {
    rotas = [];
    constructor(){
        this.rotas = [
            {regex : /^\/Home$/, page: "home"}, 
        ]
    }
    
    async executar(){
        const url = window.location.pathname.replace("/KnowledgeHub", "");
        const url_formatada = decodeURIComponent(url);
        // console.log(url_formatada)
        for (const route of this.rotas) {
            if(route.regex.test(url_formatada)){
                const params = url_formatada.match(route.regex)
                await load_func_page(route.page, params);
                return;
            }
        }
        history.pushState(null,null,"Home");
        await load_func_page('home',null);
    }
}
const routes = new Rotas();
window.addEventListener('popstate', () =>  routes.executar());
window.addEventListener("load", () =>  routes.executar());