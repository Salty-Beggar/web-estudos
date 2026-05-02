const guest_user = {
    nome: "Guest",
    img: '/assets/imgs/users/guest_user.png',
    nivel_de_acesso: "guest"
}

export function get_current_user(){
    const current_user = localStorage.getItem('usuario');
    if(!current_user){return guest_user;}
    try{
        return JSON.parse(current_user);
    }catch{
        return guest_user;      
    }
}
