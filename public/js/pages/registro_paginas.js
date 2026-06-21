import { load_home_page } from "/js/pages/home/home.js"; 
import { load_login_page } from "/js/pages/login/login.js"; 
import { load_cadastro_page } from "/js/pages/cadastro/cadastro.js";
import { load_post_page } from "/js/pages/post/post.js";
export const pages = {
    "home": { 
        "css" :{ "page" : "home", "components" : ["header","sidebar","post","filtro"]},
        "func": (param) => load_home_page(param)
    },
    "login": { 
        "css" :{ "page" : "login", "components" : []}, 
        "func": (param) => load_login_page(param)
    },
    "cadastro": {
        "css" :{"page": "cadastro", "components": []}, 
        "func": (param) => load_cadastro_page(param)
    },
    "post": {
        "css" :{"page": "post", "components": ["header"]}, 
        "func": (param) => load_post_page(param)
    },
    "generos": {
        "css" :{"page": "generos", "components": ["header"]}, 
        "func": (param) => load_generos_page(param)
    }
}