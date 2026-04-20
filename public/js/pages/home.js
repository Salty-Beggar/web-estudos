import { render_header } from '/KnowledgeHub/public/js/components/header.js';
import { get_current_user } from '/KnowledgeHub/public/js/app/usuarioAtual.js';
import '/KnowledgeHub/public/js/app/usuarioAtual.js';

export async function load_home_page(param){
    const user = get_current_user();
    const header = document.createElement('header');
    // header.innerHTML = "<h1>ola mundo</h1>";
    header.innerHTML = render_header(user);
    root.appendChild(header);
}
