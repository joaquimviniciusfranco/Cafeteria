// Armazenamento e operações do carrinho.
const STORAGE_KEY = "cafeteria:carrinho";

function lerCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
  atualizarContadorCarrinho();
}

window.adicionarAoCarrinho = function (cafe) {
  const carrinho = lerCarrinho();
  const existente = carrinho.find((item) => String(item.id) === String(cafe.id));
  if (existente) {
    existente.quantity += 1;
    existente.image = cafe.image;
  } else {
    carrinho.push({
      id: cafe.id,
      title: cafe.title,
      price: Number(cafe.price),
      image: cafe.image,
      quantity: 1,
    });
  }
  salvarCarrinho(carrinho);
};

function renderizarCarrinho() {
  const main = montarBase();
  main.append(criarElemento("h1", "mb-4", "Seu carrinho"));
  const carrinho = lerCarrinho();
  if (!carrinho.length) {
    main.append(criarElemento("p", "", "Seu carrinho está vazio."));
    const voltar = criarElemento("a", "btn btn-primary", "Ver cafés");
    voltar.href = "#inicio";
    main.append(voltar);
    return;
  }

  const lista = criarElemento("div", "list-group mb-4");
  carrinho.forEach((item) => {
    const linha = criarElemento("div", "list-group-item d-flex flex-wrap align-items-center gap-3");
    const nome = criarElemento("strong", "me-auto", item.title);
    const quantidade = criarElemento("span", "", `${item.quantity} × ${moeda(item.price)}`);
    const controles = criarElemento("div", "btn-group");
    const diminuir = criarElemento("button", "btn btn-outline-secondary", "−");
    diminuir.type = "button";
    diminuir.setAttribute("aria-label", `Diminuir ${item.title}`);
    diminuir.addEventListener("click", () => alterarQuantidade(item.id, -1));
    const aumentar = criarElemento("button", "btn btn-outline-secondary", "+");
    aumentar.type = "button";
    aumentar.setAttribute("aria-label", `Aumentar ${item.title}`);
    aumentar.addEventListener("click", () => alterarQuantidade(item.id, 1));
    const remover = criarElemento("button", "btn btn-outline-danger", "Remover");
    remover.type = "button";
    remover.addEventListener("click", () => removerItem(item.id));
    controles.append(diminuir, aumentar, remover);
    linha.append(nome, quantidade, criarElemento("strong", "", moeda(item.price * item.quantity)), controles);
    lista.append(linha);
  });
  main.append(lista);
  const total = carrinho.reduce((soma, item) => soma + item.price * item.quantity, 0);
  main.append(criarElemento("p", "fs-4 fw-bold text-end", `Total: ${moeda(total)}`));
  const checkout = criarElemento("a", "btn btn-success", "Ir para checkout");
  checkout.href = "#checkout";
  main.append(checkout);
}

function alterarQuantidade(id, delta) {
  const atualizado = lerCarrinho().map((item) => String(item.id) === String(id)
    ? { ...item, quantity: item.quantity + delta }
    : item).filter((item) => item.quantity > 0);
  salvarCarrinho(atualizado);
  renderizarCarrinho();
}

function removerItem(id) {
  salvarCarrinho(lerCarrinho().filter((item) => String(item.id) !== String(id)));
  renderizarCarrinho();
}
