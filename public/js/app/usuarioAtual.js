const guest_user = {
    name: "Guest",
    img: '/KnowledgeHub/public/assetc/imgs/guestUser.png',
    type: "guest"
}

export function get_current_user(){
    const current_user = localStorage.getItem('user');
    if(!current_user){return guest_user;}
    try{
        return JSON.stringify(current_user);
    }catch{
        return JSON.stringify(guest_user)
    }
}
