export function load_generos_page(param) {
    const root = document.getElementById("root");
    const genero = param?.[1]?.replace(/_/g, " ") ?? "";
    root.innerHTML = `<main class="genero_pagina"><h1>Gênero: ${genero}</h1><p>A página de gênero já recebe o slug pela rota. Dá para ligar ela em uma busca depois.</p></main>`;
}
