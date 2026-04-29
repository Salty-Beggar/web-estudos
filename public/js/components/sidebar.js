export async function create_sidebar(user_id){
    const sidebar = document.createElement("aside");
    const data_objects = await Promise.all([ 
        fetch_servers(user_id), 
        fetch_courses(user_id), 
        fetch_friends(user_id), 
        fetch_groups(user_id), 
        fetch_chats(user_id)
    ]);

    const relation = {
        "Servidores" : "/servers/",
        "Cursos" : "/courses/",
        "Amigos" : "/friends/",
        "Grupos" : "/groups/",
        "Chats" : "/chats/"
    };

    data_objects.forEach((object) => {
        if(object.data.length == 0){
            const section = document.createElement("section"); 
            const sub_tittle = document.createElement("h2"); 
            const paragraph = document.createElement("p");
            
            section.classList.add("sidebar-section");
            sub_tittle.classList.add("sidebar-section-tittle");
            paragraph.classList.add("sidebar-section-paragraph");
            
            sub_tittle.innerText = object.tittle;
            paragraph.innerText = object.empty_message;
            
            section.appendChild(sub_tittle);
            section.appendChild(paragraph);
            sidebar.appendChild(section);
        }else{
            const section = document.createElement("section"); 
            const sub_tittle = document.createElement("h2"); 
            
            sidebar.appendChild(section);
            section.appendChild(sub_tittle);

            section.classList.add("sidebar-section");
            sub_tittle.classList.add("sidebar-section-tittle");
            sub_tittle.innerText = object.tittle;
            for(let item of object.data){
                const item_div = document.createElement("div");
                const item_img = document.createElement("img");
                const item_tittle = document.createElement("p");

                item_img.src = item.path_picture;
                item_tittle.innerText = item.name;

                item_div.appendChild(item_img);
                item_div.appendChild(item_tittle);
                section.appendChild(item_div);

                item_div.classList.add("sidebar-item");
                item_img.classList.add("sidebar-item-img");
                item_tittle.classList.add("sidebar-item-tittle");

                item_div.addEventListener("click", () => {
                    if(object.tittle in relation){
                        history.pushState(null, null, `/KnowledgeHub${relation[object.tittle]}${item.id}`);
                    }
                });

            }
        }
    });
    return sidebar;
}

async function fetch_servers(user_id){
    // const data = await fetch(`/KnowledgeHub/api/servers/${user_id}`);  
    // const response = await data.json();
    const object = {
        data : response ?? [],
        tittle : "Servidores",
        empty_message : "Voce nao esta participando de nenhum servidor"
    };
    return object;
}

async function fetch_courses(user_id){
    // const data = await fetch(`/KnowledgeHub/api/courses/${user_id}`);  
    // const response = await data.json(); 
    const object = {
        data : response ?? [],
        tittle : "Cursos",
        empty_message : "Voce nao esta participando de nenhum curso"
    };
    return object;
}

async function fetch_friends(user_id){
    // const data = await fetch(`/KnowledgeHub/api/friends/${user_id}`);  
    // const response = await data.json(); 
    const object = {
        data : response ?? [],
        tittle : "Amigos",
        empty_message : "Voce nao tem nenhum amigo"
    };
    return object;
}

async function fetch_groups(user_id){
    // const data = await fetch(`/KnowledgeHub/api/groups/${user_id}`);  
    // const response = await data.json(); 
    const object = {
        data : response ?? [],
        tittle : "Grupos",
        empty_message : "Voce nao esta participando de nenhum grupo"
    };
    return object;
}

async function fetch_chats(user_id){
    // const data = await fetch(`/KnowledgeHub/api/chats/${user_id}`);  
    // const response = await data.json(); 
    const object = {
        data : response ?? [],
        tittle : "Chats",
        empty_message : "Voce nao esta participando de nenhum chat"
    };
    return object;
}