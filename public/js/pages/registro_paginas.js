import { load_home_page } from "/js/pages/home.js"; 
import { load_login_page } from "/js/pages/login.js"; 
import { load_cadastro_page } from "/js/pages/cadastro.js"; 

export const pages = {
    "home": { 
        "css" :{ "page" : "home", "components" : ["header","sidebar","post"]},
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
}