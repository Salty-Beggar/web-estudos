// import { routes } from "/js/app/router";

export async function renderizar_barra_lateral(){
    const dados_usuario = await fetch_dados_user()
    return criar_barra_lateral(dados_usuario);
}
function criar_barra_lateral(dados_usuario){
    const barra_lateral = document.createElement("aside")
    barra_lateral.setAttribute("id","barra_lateral")

    Object.entries(dados_usuario).forEach(([index,valores]) => {
        const sessao_item = document.createElement("section")
        sessao_item.classList.add("sessao_barra_lateral")

        const titulo_sessao = document.createElement("h2")
        titulo_sessao.classList.add("titulo_sessao")
       
        
        const corpo_sessao = document.createElement("div")
        corpo_sessao.classList.add("corpo_sessao")
        titulo_sessao.addEventListener("click",(e) => {
            var display = corpo_sessao.style.display
            if(display != "flex" )corpo_sessao.style.display = "flex"    
            else if(display == "flex")corpo_sessao.style.display = "none"
        })
        barra_lateral.appendChild(sessao_item);
        sessao_item.appendChild(titulo_sessao);
        sessao_item.appendChild(corpo_sessao);

        sessao_item.setAttribute("id",`sessao_${index}`)
        titulo_sessao.innerText = index
        inserir_dados(corpo_sessao, [index,valores])
    });
    // const root = document.getElementById("root")
    root.appendChild(barra_lateral)
}
function inserir_dados(corpo_sessao, itens){
    itens[1].forEach(item => {
        const amigo = document.createElement("div")
        amigo.classList.add("item_barra_lateral")
        amigo.addEventListener("click", async (e) => {
            // console.log(corpo_sessao, item, itens)
            history.pushState(null, null, `/${itens[0]}/${item.id}`);
            // await routes.executar();
        })

        const avatar = document.createElement("img")
        avatar.classList.add("imagem_item_barra_lateral")

        const nome = document.createElement("p")
        nome.classList.add("nome_item_barra_lateral")

        corpo_sessao.appendChild(amigo)
        amigo.appendChild(avatar)
        amigo.appendChild(nome)

        nome.innerText = item.nome
        avatar.src = item.img            
    });
}
async function fetch_dados_user(){
    const usuario_storage = JSON.parse(localStorage.getItem("usuario"))
    const id = usuario_storage.id;
    const resposta = await fetch(`http://localhost:3000/usuario/${id}`)
    const dados = await resposta.json();
    const usuario = dados.usuario;

    const dados_usuario = {
        "amigos" : usuario.amigos,
        "grupos" : usuario.servidores[0].grupos,
        "cursos" : usuario.servidores[0].cursos,
        "servidores" : usuario.servidores
    }
    return dados_usuario
}