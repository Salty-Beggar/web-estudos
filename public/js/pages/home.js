import { render_header } from '../components/header.js';
import { get_current_user } from '../app/usuarioAtual.js';
import '../app/usuarioAtual.js';

export async function load_home_page(param){
    const user = get_current_user();
    const header = document.createElement('header');
    header.innerHTML = render_header(user);
    root.appendChild(header);
}
