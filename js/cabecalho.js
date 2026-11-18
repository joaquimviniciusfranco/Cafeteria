// Atualiza o número total de unidades no carrinho
function atualizarContadorCarrinho() {
  // Localiza o elemento que mostra a quantidade na navegação.
  const contador = document.getElementById("contador-carrinho");
  // Se o elemento existir, soma as quantidades salvas no carrinho e atualiza o texto.
  if (contador) contador.textContent = lerCarrinho().reduce((soma, item) => soma + item.quantity, 0);
}


//Cria a estrutura compartilhada pelas telas: navegação, contador do carrinho e área principal.
function montarBase() {
   // Limpa a tela antes de montar a próxima página.
  root.replaceChildren();
    // Cria a barra de navegação e seu conteúdo
  const nav = criarElemento("nav", "navbar navbar-expand bg-dark navbar-dark");
  const containerNav = criarElemento("div", "container");
   // Cria o link que volta para a página inicial
  const marca = criarElemento("a", "navbar-brand", "Cafeteria");
  marca.href = "#inicio";
  // Cria o link para abrir o carrinho.
  const linkCarrinho = criarElemento(
  "a",
  "btn btn-outline-light",
  "🛒 Carrinho "
);
  linkCarrinho.href = "#carrinho";

  // Cria o espaço onde o total de unidades será exibido.
  const contador = criarElemento("span", "badge bg-warning text-dark", "0");
  contador.id = "contador-carrinho";

    // Organiza os links dentro da navegação.
  linkCarrinho.append(contador);
  containerNav.append(marca, linkCarrinho);
  nav.append(containerNav);
  root.append(nav);
  // Cria a área onde cada tela colocará seu próprio conteúdo
  const main = criarElemento("main", "container py-5");
  main.id = "conteudo";
  root.append(main);
  // Atualiza o contador e devolve a área principal.
  atualizarContadorCarrinho();
  return main;
}
