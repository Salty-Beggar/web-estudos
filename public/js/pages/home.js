import { render_header } from '/KnowledgeHub/public/js/components/header.js';
import { render_sidebar } from '/KnowledgeHub/public/js/components/sidebar.js';
import { get_current_user } from '/KnowledgeHub/public/js/app/usuarioAtual.js';
import '/KnowledgeHub/public/js/app/usuarioAtual.js';

export async function load_home_page(param){
    const user = get_current_user();
    const header = document.createElement('header');
    const sidebar = document.createElement('section');
    header.innerHTML = render_header(user);
    sidebar.innerHTML = await render_sidebar();
    root.appendChild(header);
    root.appendChild(sidebar);
}
