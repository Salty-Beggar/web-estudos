import { api_fetch, extrair_mensagem, normalizar_usuario } from "/js/app/api.js";

export async function renderizar_barra_lateral(){
    const dados_usuario = await fetch_dados_user()
    return criar_barra_lateral(dados_usuario);
}
function criar_barra_lateral(dados_usuario){
    const root = document.getElementById("root");
    const barra_lateral = document.createElement("aside")
    barra_lateral.setAttribute("id","barra_lateral")

    Object.entries(dados_usuario).forEach(([index,valores]) => {
        const sessao_item = document.createElement("section")
        sessao_item.classList.add("sessao_barra_lateral")

        const titulo_sessao = document.createElement("h2")
        titulo_sessao.classList.add("titulo_sessao")
       
        const corpo_sessao = document.createElement("div")
        corpo_sessao.classList.add("corpo_sessao")
        titulo_sessao.addEventListener("click",() => {
            const display = corpo_sessao.style.display
            if(display != "flex" )corpo_sessao.style.display = "flex"    
            else if(display == "flex")corpo_sessao.style.display = "none"
        })
        barra_lateral.appendChild(sessao_item);
        sessao_item.appendChild(titulo_sessao);
        sessao_item.appendChild(corpo_sessao);

        sessao_item.setAttribute("id",`sessao_${index}`)
        titulo_sessao.innerText = index
        inserir_dados(corpo_sessao, [index,valores ?? []])
    });
    root.appendChild(barra_lateral)
}
function inserir_dados(corpo_sessao, itens){
    itens[1].forEach(item => {
        const item_barra = document.createElement("div")
        item_barra.classList.add("item_barra_lateral")
        item_barra.addEventListener("click", async () => {
            if (itens[0] === "cursos" && item.id) {
                history.pushState(null, null, `/Post/${item.id}`);
                const { routes } = await import("/js/app/router.js");
                await routes.executar();
            }
        })

        const avatar = document.createElement("img")
        avatar.classList.add("imagem_item_barra_lateral")
        avatar.setAttribute("alt", item.nome ?? item.titulo ?? "Item")

        const nome = document.createElement("p")
        nome.classList.add("nome_item_barra_lateral")

        corpo_sessao.appendChild(item_barra)
        item_barra.appendChild(avatar)
        item_barra.appendChild(nome)

        nome.innerText = item.nome ?? item.titulo ?? "Item"
        avatar.src = item.img ?? item.foto ?? imagem_padrao(itens[0])
        avatar.onerror = () => { avatar.src = "/assets/imgs/users/guest_user.svg"; }
    });
}
function imagem_padrao(secao){
    if(secao === "categorias") return "/assets/imgs/groups/duvidas-programacao.png";
    if(secao === "feeds") return "/assets/imgs/groups/1.png";
    return "/assets/imgs/users/guest_user.svg";
}
async function fetch_dados_user(){
    const usuario_storage = JSON.parse(localStorage.getItem("usuario") ?? "{}");
    if (!usuario_storage.id) {
        return { "feeds": [], "cursos": [], "categorias": [] };
    }

    const dados = await api_fetch(`/usuario/${usuario_storage.id}`)
    const resposta = extrair_mensagem(dados);
    const usuario = resposta.usuario ?? resposta;

    console.log("Dados do usuário:", usuario);
    return {
        "feeds" : usuario.feeds ?? [],
        "cursos" : usuario.cursos ?? [],
        "categorias" : usuario.categorias ?? [],
        "amigos" : (usuario.amigos ?? []).map(normalizar_usuario)
    }
}
