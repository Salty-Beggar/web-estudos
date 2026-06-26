import { get_current_user } from "/js/app/usuario_atual.js";
import { routes } from "/js/app/router.js";
import { api_fetch, extrair_mensagem, normalizar_usuario } from "/js/app/api.js";

export function renderizar_cabecalho(){
    const root = document.getElementById("root");
    const cabecalho = document.createElement("header");
    const navegacao = document.createElement("nav");
    const pesquisas = document.createElement("form");
    const usuario_cabecalho = document.createElement("button");
    const usuario = get_current_user();

    cabecalho.appendChild(navegacao);
    cabecalho.appendChild(pesquisas);
    cabecalho.appendChild(usuario_cabecalho);

    navegacao.classList.add("cabecalho_navegacao");
    pesquisas.classList.add("cabecalho_pesquisa");
    usuario_cabecalho.classList.add("cabecalho_usuario", "cabecalho_usuario_botao");
    usuario_cabecalho.type = "button";
    usuario_cabecalho.title = "Ver dados do usuário";

    const botao_menu = document.createElement("button");
    botao_menu.classList.add("botao_cabecalho");
    botao_menu.setAttribute("id","botao_menu");
    botao_menu.setAttribute("type","button");
    navegacao.appendChild(botao_menu);
    botao_menu.innerText = "Menu";

    const botao_Home = document.createElement("button");
    botao_Home.classList.add("botao_cabecalho", "botao_home");
    botao_Home.setAttribute("type","button");
    navegacao.appendChild(botao_Home);
    botao_Home.innerText = "Home";
    botao_Home.addEventListener("click", async () => {
        history.pushState(null, null, "/Home");
        await routes.executar();
    });

    const input_pesquisa = document.createElement("input");
    input_pesquisa.classList.add("input_pesquisa");
    input_pesquisa.setAttribute("type","text");
    input_pesquisa.setAttribute("placeholder","Pesquisar...");
    pesquisas.appendChild(input_pesquisa);

    const botao_pesquisa = document.createElement("button");
    botao_pesquisa.classList.add("botao_cabecalho", "botao_pesquisa");
    botao_pesquisa.setAttribute("type","submit");
    botao_pesquisa.innerText = "Pesquisar";
    pesquisas.appendChild(botao_pesquisa);

    const botao_filtro = document.createElement("button");
    botao_filtro.classList.add("botao_cabecalho", "botao_filtro");
    botao_filtro.setAttribute("type","button");
    botao_filtro.innerText = "Filtrar";
    pesquisas.appendChild(botao_filtro);

    pesquisas.addEventListener("submit", (evento) => {
        evento.preventDefault();
        window.dispatchEvent(new CustomEvent("knowledgehub:pesquisar", {
            detail: { pesquisa: input_pesquisa.value }
        }));
    });

    const nome_usuario = document.createElement("span");
    nome_usuario.classList.add("nome_usuario");
    nome_usuario.innerText = usuario.nome;
    usuario_cabecalho.appendChild(nome_usuario);

    const avatar_usuario = document.createElement("img");
    avatar_usuario.classList.add("avatar_usuario");
    avatar_usuario.setAttribute("src", usuario.img);
    avatar_usuario.onerror = () => { avatar_usuario.src = "/assets/imgs/users/guest_user.svg"; };
    avatar_usuario.setAttribute("alt", "Avatar do usuário");
    usuario_cabecalho.appendChild(avatar_usuario);

    usuario_cabecalho.addEventListener("click", abrir_modal_usuario);
    root.appendChild(cabecalho);
}

async function abrir_modal_usuario(){
    fechar_modal_usuario();

    const usuarioLocal = get_current_user();
    let usuario = usuarioLocal;
    try {
        const dados = await api_fetch("/auth/me");
        usuario = normalizar_usuario(extrair_mensagem(dados));
        salvar_usuario_local(usuario);
    } catch (erro) {
        console.warn("Usando usuário salvo localmente:", erro.message);
    }

    const overlay = document.createElement("div");
    overlay.classList.add("modal_usuario_overlay");
    overlay.id = "modal_usuario_overlay";

    const modal = document.createElement("section");
    modal.classList.add("modal_usuario");

    const topo = document.createElement("div");
    topo.classList.add("modal_usuario_topo");

    const avatar = document.createElement("img");
    avatar.classList.add("modal_usuario_avatar");
    avatar.src = usuario.img;
    avatar.onerror = () => { avatar.src = "/assets/imgs/users/guest_user.svg"; };

    const dadosTopo = document.createElement("div");
    const titulo = document.createElement("h2");
    titulo.innerText = usuario.nome ?? "Usuário";
    const email = document.createElement("p");
    email.innerText = usuario.email ?? "";
    dadosTopo.append(titulo, email);
    topo.append(avatar, dadosTopo);

    const form = document.createElement("form");
    form.classList.add("form_usuario");

    const inputNome = criar_campo_usuario("Nome", "text", usuario.nome ?? "");
    const inputEmail = criar_campo_usuario("Email", "email", usuario.email ?? "");
    const labelBio = document.createElement("label");
    labelBio.innerText = "Biografia";
    const textareaBio = document.createElement("textarea");
    textareaBio.rows = 3;
    textareaBio.value = usuario.biografia ?? "";

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem_modal_usuario");

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_modal_usuario");
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.classList.add("botao_usuario_secundario");
    fechar.innerText = "Fechar";
    fechar.addEventListener("click", fechar_modal_usuario);

    const salvar = document.createElement("button");
    salvar.type = "submit";
    salvar.classList.add("botao_usuario_principal");
    salvar.innerText = "Salvar dados";

    acoes.append(fechar, salvar);
    form.append(inputNome.label, inputNome.input, inputEmail.label, inputEmail.input, labelBio, textareaBio, mensagem, acoes);

    const blocoImagem = criar_bloco_imagem_usuario({ usuario, avatar, mensagem });

    modal.append(topo, form, blocoImagem);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) fechar_modal_usuario();
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagem.innerText = "";
        salvar.disabled = true;
        salvar.innerText = "Salvando...";
        try {
            const dados = await api_fetch("/usuario/update", {
                method: "PUT",
                body: {
                    nome: inputNome.input.value.trim(),
                    email: inputEmail.input.value.trim(),
                    biografia: textareaBio.value.trim()
                }
            });
            const usuarioAtualizado = normalizar_usuario(extrair_mensagem(dados));
            salvar_usuario_local(usuarioAtualizado);
            atualizar_header_usuario(usuarioAtualizado);
            titulo.innerText = usuarioAtualizado.nome;
            email.innerText = usuarioAtualizado.email;
            mensagem.innerText = "Dados atualizados.";
        } catch (erro) {
            mensagem.innerText = erro.message;
        } finally {
            salvar.disabled = false;
            salvar.innerText = "Salvar dados";
        }
    });
}

function criar_campo_usuario(texto, tipo, valor){
    const label = document.createElement("label");
    label.innerText = texto;
    const input = document.createElement("input");
    input.type = tipo;
    input.value = valor;
    input.required = texto !== "Biografia";
    return { label, input };
}

function criar_bloco_imagem_usuario({ usuario, avatar, mensagem }){
    const bloco = document.createElement("section");
    bloco.classList.add("bloco_imagem_usuario");

    const titulo = document.createElement("h3");
    titulo.innerText = "Imagem do usuário";

    const texto = document.createElement("p");
    texto.innerText = "Escolha uma imagem, arraste para ajustar o centro e salve o recorte.";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";

    const recorte = document.createElement("div");
    recorte.classList.add("avatar_recorte_area");

    const imagemPreview = document.createElement("img");
    imagemPreview.alt = "Prévia da imagem";
    imagemPreview.draggable = false;
    imagemPreview.src = usuario.img;
    recorte.appendChild(imagemPreview);

    const zoom = document.createElement("input");
    zoom.type = "range";
    zoom.min = "1";
    zoom.max = "3";
    zoom.step = "0.05";
    zoom.value = "1";

    const salvarImagem = document.createElement("button");
    salvarImagem.type = "button";
    salvarImagem.classList.add("botao_usuario_principal");
    salvarImagem.innerText = "Salvar imagem";
    salvarImagem.disabled = true;

    const estado = {
        arquivoDataUrl: null,
        imagemFonte: null,
        offsetX: 0,
        offsetY: 0,
        zoom: 1,
        dragging: false,
        startX: 0,
        startY: 0,
        startOffsetX: 0,
        startOffsetY: 0
    };

    function atualizarPreview(){
        imagemPreview.style.transform = `translate(${estado.offsetX}px, ${estado.offsetY}px) scale(${estado.zoom})`;
    }

    input.addEventListener("change", () => {
        const arquivo = input.files?.[0];
        if (!arquivo) return;
        if (arquivo.size > 8 * 1024 * 1024) {
            mensagem.innerText = "Escolha uma imagem de até 8 MB.";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            estado.arquivoDataUrl = String(reader.result);
            estado.offsetX = 0;
            estado.offsetY = 0;
            estado.zoom = 1;
            zoom.value = "1";
            imagemPreview.src = estado.arquivoDataUrl;
            estado.imagemFonte = new Image();
            estado.imagemFonte.onload = () => {
                salvarImagem.disabled = false;
                atualizarPreview();
            };
            estado.imagemFonte.src = estado.arquivoDataUrl;
        };
        reader.readAsDataURL(arquivo);
    });

    zoom.addEventListener("input", () => {
        estado.zoom = Number(zoom.value);
        atualizarPreview();
    });

    recorte.addEventListener("pointerdown", (evento) => {
        if (!estado.arquivoDataUrl) return;
        estado.dragging = true;
        estado.startX = evento.clientX;
        estado.startY = evento.clientY;
        estado.startOffsetX = estado.offsetX;
        estado.startOffsetY = estado.offsetY;
        recorte.setPointerCapture(evento.pointerId);
    });

    recorte.addEventListener("pointermove", (evento) => {
        if (!estado.dragging) return;
        estado.offsetX = estado.startOffsetX + (evento.clientX - estado.startX);
        estado.offsetY = estado.startOffsetY + (evento.clientY - estado.startY);
        atualizarPreview();
    });

    recorte.addEventListener("pointerup", (evento) => {
        estado.dragging = false;
        try { recorte.releasePointerCapture(evento.pointerId); } catch {}
    });

    salvarImagem.addEventListener("click", async () => {
        if (!estado.imagemFonte) return;
        mensagem.innerText = "";
        salvarImagem.disabled = true;
        salvarImagem.innerText = "Salvando...";
        try {
            const imagemRecortada = gerar_avatar_recortado(estado);
            const dados = await api_fetch("/usuario/avatar", {
                method: "POST",
                body: { imagem: imagemRecortada }
            });
            const usuarioAtualizado = normalizar_usuario(extrair_mensagem(dados));
            salvar_usuario_local(usuarioAtualizado);
            atualizar_header_usuario(usuarioAtualizado);
            avatar.src = usuarioAtualizado.img;
            imagemPreview.src = usuarioAtualizado.img;
            mensagem.innerText = "Imagem atualizada.";
        } catch (erro) {
            mensagem.innerText = erro.message;
        } finally {
            salvarImagem.disabled = false;
            salvarImagem.innerText = "Salvar imagem";
        }
    });

    bloco.append(titulo, texto, input, recorte, zoom, salvarImagem);
    return bloco;
}

function gerar_avatar_recortado(estado){
    const tamanho = 512;
    const canvas = document.createElement("canvas");
    canvas.width = tamanho;
    canvas.height = tamanho;
    const ctx = canvas.getContext("2d");
    const img = estado.imagemFonte;

    const preview = 220;
    const baseScalePreview = Math.max(preview / img.naturalWidth, preview / img.naturalHeight);
    const displayW = img.naturalWidth * baseScalePreview * estado.zoom;
    const displayH = img.naturalHeight * baseScalePreview * estado.zoom;
    const scaleOutput = tamanho / preview;
    const drawW = displayW * scaleOutput;
    const drawH = displayH * scaleOutput;
    const x = (tamanho - drawW) / 2 + estado.offsetX * scaleOutput;
    const y = (tamanho - drawH) / 2 + estado.offsetY * scaleOutput;

    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, tamanho, tamanho);
    ctx.drawImage(img, x, y, drawW, drawH);
    return canvas.toDataURL("image/png", 0.92);
}

function salvar_usuario_local(usuario){
    const atual = get_current_user();
    const mesclado = normalizar_usuario({ ...atual, ...usuario });
    localStorage.setItem("usuario", JSON.stringify(mesclado));
}

function atualizar_header_usuario(usuario){
    const nome = document.querySelector(".cabecalho_usuario .nome_usuario");
    const avatar = document.querySelector(".cabecalho_usuario .avatar_usuario");
    if (nome) nome.innerText = usuario.nome ?? "Usuário";
    if (avatar) avatar.src = usuario.img ?? "/assets/imgs/users/guest_user.svg";
}

function fechar_modal_usuario(){
    document.getElementById("modal_usuario_overlay")?.remove();
}
