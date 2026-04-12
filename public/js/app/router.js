import { LoadHomePage } from '/KnowledgeHub/public/js/pages/home.js'; 

async function LoadHtmlPage(namePageHtml){
    const root = document.getElementById('root');    
    const resposta = await fetch(`/KnowledgeHub/public/pages/${namePageHtml}.html`);
    const dados = await resposta.text();
    root.innerHTML = dados;
}

function LoadCssPage(namePageCss){
    const oldCss = document.getElementById('cssPage');
    if(oldCss) oldCss.remove();
    const head = document.querySelector("head");
    const newCss = document.createElement("link");
    newCss.id = 'cssPage';
    newCss.rel = "stylesheet";
    newCss.href = `/KnowledgeHub/public/css/${namePageCss}.css`
    head.appendChild(newCss);
}

async function LoadFuncPage(page, param){
    const relacoes = {
        home : {
            css: (page) => LoadCssPage(page), 
            html: (page) => LoadHtmlPage(page), 
            func: (param) => LoadHomePage(param)
        }
    }
    const dataPage = relacoes[page];
    dataPage.css(page);
    await dataPage.html(page);
    dataPage.func(param);
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
        const urlFormatada = decodeURIComponent(url);
        for (const rota of this.rotas) {
            if(rota.regex.test(urlFormatada)){
                const params = urlFormatada.match(rota.regex)
                await LoadFuncPage(rota.page, params);
                return;
            }
        }
        history.pushState(null,null,"Home");
        await LoadFuncPage('home',null);
    }
}
const routes = new Rotas();
window.addEventListener('popstate', () =>  routes.executar());
window.addEventListener("load", () =>  routes.executar());