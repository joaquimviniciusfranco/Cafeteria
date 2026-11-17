function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");
  if (contador) contador.textContent = lerCarrinho().reduce((soma, item) => soma + item.quantity, 0);
}

// Contrato para a tela de produtos: chamar window.adicionarAoCarrinho(cafe).
// Produto recebido no formato de db.json: { id, title, description, price }.

function montarBase() {
  root.replaceChildren();
  const nav = criarElemento("nav", "navbar navbar-expand bg-dark navbar-dark");
  const containerNav = criarElemento("div", "container");
  const marca = criarElemento("a", "navbar-brand", "Cafeteria");
  marca.href = "#inicio";
  const linkCarrinho = criarElemento(
  "a",
  "btn btn-outline-light",
  "🛒 Carrinho "
);
  linkCarrinho.href = "#carrinho";
  const contador = criarElemento("span", "badge bg-warning text-dark", "0");
  contador.id = "contador-carrinho";
  linkCarrinho.append(contador);
  containerNav.append(marca, linkCarrinho);
  nav.append(containerNav);
  root.append(nav);
  const main = criarElemento("main", "container py-5");
  main.id = "conteudo";
  root.append(main);
  atualizarContadorCarrinho();
  return main;
}
