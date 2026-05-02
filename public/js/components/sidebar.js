export async function render_barra_lateral(){
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

        barra_lateral.appendChild(sessao_item);
        sessao_item.appendChild(titulo_sessao);
        sessao_item.appendChild(corpo_sessao);

        sessao_item.setAttribute("id",`sessao_${index}`)
        titulo_sessao.innerText = index
        inserir_dados(corpo_sessao, [index,valores])
    });
    return barra_lateral;
}
function inserir_dados(corpo_sessao, itens){
    itens[1].forEach(item => {
        const amigo = document.createElement("div")
        amigo.classList.add("item_barra_lateral")

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
 // data_objects.forEach((object) => {
    //     if(object.data.length == 0){
    //         const section = document.createElement("section"); 
    //         const sub_tittle = document.createElement("h2"); 
    //         const paragraph = document.createElement("p");
            
    //         section.classList.add("sidebar-section");
    //         sub_tittle.classList.add("sidebar-section-tittle");
    //         paragraph.classList.add("sidebar-section-paragraph");
            
    //         sub_tittle.innerText = object.tittle;
    //         paragraph.innerText = object.empty_message;
            
    //         section.appendChild(sub_tittle);
    //         section.appendChild(paragraph);
    //         sidebar.appendChild(section);
    //     }else{
    //         const section = document.createElement("section"); 
    //         const sub_tittle = document.createElement("h2"); 
            
    //         sidebar.appendChild(section);
    //         section.appendChild(sub_tittle);

    //         section.classList.add("sidebar-section");
    //         sub_tittle.classList.add("sidebar-section-tittle");
    //         sub_tittle.innerText = object.tittle;
    //         for(let item of object.data){
    //             const item_div = document.createElement("div");
    //             const item_img = document.createElement("img");
    //             const item_tittle = document.createElement("p");

    //             item_img.src = item.path_picture;
    //             item_tittle.innerText = item.name;

    //             item_div.appendChild(item_img);
    //             item_div.appendChild(item_tittle);
    //             section.appendChild(item_div);

    //             item_div.classList.add("sidebar-item");
    //             item_img.classList.add("sidebar-item-img");
    //             item_tittle.classList.add("sidebar-item-tittle");

    //             item_div.addEventListener("click", () => {
    //                 if(object.tittle in relation){
    //                     history.pushState(null, null, `/KnowledgeHub${relation[object.tittle]}${item.id}`);
    //                 }
    //             });

    //         }
    //     }
    // });
    // return sidebar;