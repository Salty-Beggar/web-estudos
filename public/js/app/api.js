export const API_BASE_URL = "http://localhost:8010";

export function get_token() {
    return localStorage.getItem("token");
}

export function usuario_img(usuario = {}) {
    const foto = usuario.img ?? usuario.foto ?? "";
    if (foto) return foto;
    return "/assets/imgs/users/guest_user.svg";
}

export function normalizar_usuario(usuario = {}) {
    return {
        ...usuario,
        img: usuario_img(usuario),
        nivel_de_acesso: usuario.nivel_de_acesso ?? "usuario"
    };
}

export function extrair_mensagem(dados) {
    return dados?.mensagem ?? dados?.message ?? dados?.dados ?? dados;
}


export function extrair_lista(dados, chaves = []) {
    const valor = extrair_mensagem(dados);

    if (Array.isArray(valor)) return valor;
    if (valor === null || valor === undefined) return [];

    if (typeof valor === "object") {
        const chaves_possiveis = [
            ...chaves,
            "posts",
            "feeds",
            "categorias",
            "generos",
            "items",
            "lista",
            "dados",
            "mensagem"
        ];

        for (const chave of chaves_possiveis) {
            const lista = valor[chave];
            if (Array.isArray(lista)) return lista;
        }
    }

    return [];
}

function formatar_erro_api(mensagem) {
    if (typeof mensagem === "string") return mensagem;
    if (mensagem?.erro) {
        const local = mensagem.arquivo && mensagem.linha ? ` (${mensagem.arquivo}:${mensagem.linha})` : "";
        return `${mensagem.erro}${local}`;
    }
    return "Erro ao conversar com a API.";
}

export async function api_fetch(path, options = {}) {
    const {
        method = "GET",
        body = null,
        auth = true,
        headers = {}
    } = options;

    const final_headers = { ...headers };

    if (body !== null && !(body instanceof FormData)) {
        final_headers["Content-Type"] = "application/json";
    }

    const token = get_token();
    if (auth && token) {
        final_headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: final_headers,
        body: body === null ? null : body instanceof FormData ? body : JSON.stringify(body)
    });

    const texto = await resposta.text();
    let dados;

    try {
        dados = texto ? JSON.parse(texto) : {};
    } catch (erro) {
        throw new Error(`A API respondeu algo que não é JSON: ${texto.slice(0, 200)}`);
    }

    const sucesso = dados.success ?? dados.sucesso ?? resposta.ok;
    if (!resposta.ok || sucesso === false) {
        const mensagem = extrair_mensagem(dados);
        throw new Error(formatar_erro_api(mensagem));
    }

    return dados;
}

export function normalizar_categoria(categoria = {}) {
    return {
        id: Number(categoria.id),
        genero: categoria.nome ?? categoria.genero ?? "Sem categoria",
        nome: categoria.nome ?? categoria.genero ?? "Sem categoria",
        pontos: Number(categoria.votos ?? categoria.pontos ?? 0),
        voto_usuario: Number(categoria.voto_usuario ?? 0)
    };
}

export function normalizar_tipo_post(tipo) {
    const tipos = {
        1: "curso",
        2: "artigo",
        3: "questionario",
        4: "atividade"
    };

    if (typeof tipo === "string" && Number.isNaN(Number(tipo))) return tipo;
    return tipos[Number(tipo)] ?? "post";
}

function remover_markdown(texto = "") {
    return String(texto)
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^[-*]\s+/gm, "")
        .replace(/^\d+[.)]\s+/gm, "")
        .replace(/[>*_#`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function resumo_texto(texto = "", limite = 170) {
    const limpo = remover_markdown(texto);
    if (limpo.length <= limite) return limpo;
    return `${limpo.slice(0, limite).trim()}...`;
}

export function normalizar_post(post = {}) {
    const usuario = normalizar_usuario(post.usuario ?? post.autor ?? {});
    const tipo_id = post.tipo_id ?? (Number.isNaN(Number(post.tipo)) ? null : Number(post.tipo));
    const tipo = post.tipo_nome ?? normalizar_tipo_post(post.tipo_id ?? post.tipo);

    const descricao = post.descricao
        ?? post.resumo
        ?? (tipo === "artigo" ? resumo_texto(post.corpo ?? "") : resumo_texto(post.texto_atividade ?? post.enunciado ?? ""));

    return {
        ...post,
        tipo_id,
        tipo,
        texto_atividade: post.texto_atividade ?? post.texto ?? "",
        explicacao_atividade: post.explicacao_atividade ?? post.explicacao ?? "",
        autor: {
            id: usuario.id,
            nome: usuario.nome ?? "Usuário",
            img: usuario.img
        },
        descricao,
        generos: Array.isArray(post.categorias ?? post.generos) ? (post.categorias ?? post.generos).map(normalizar_categoria) : []
    };
}
