export async function create_sidebar(user_id){
    const sidebar = document.createElement("aside");
    const data_objects = await Promise.all([ 
        fetch_servers(user_id), 
        fetch_courses(user_id), 
        fetch_friends(user_id), 
        fetch_groups(user_id), 
        fetch_chats(user_id)
    ]);

    data_objects.forEach((object) => {
        if(Object.length(object) == 0){
            const section = document.createElement("section"); 
            const h2 = document.createElement("h2"); 
            const p = document.createElement("p");

        }
    });

}

async function fetch_servers(user_id){
    const data = await fetch(`/KnowledgeHub/api/servers/${user_id}`);  
    const response = await data.json(); 
    return response??[];
}

async function fetch_courses(user_id){
    const data = await fetch(`/KnowledgeHub/api/courses/${user_id}`);  
    const response = await data.json(); 
    return response??[];
}

async function fetch_friends(user_id){
    const data = await fetch(`/KnowledgeHub/api/friends/${user_id}`);  
    const response = await data.json(); 
    return response??[];
}

async function fetch_groups(user_id){
    const data = await fetch(`/KnowledgeHub/api/groups/${user_id}`);  
    const response = await data.json(); 
    return response??[];
}

async function fetch_chats(user_id){
    const data = await fetch(`/KnowledgeHub/api/chats/${user_id}`);  
    const response = await data.json(); 
    return response??[];
}
