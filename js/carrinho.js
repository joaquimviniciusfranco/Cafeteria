// Armazenamento e operações do carrinho.

// Nome usado para guardar e encontrar o carrinho no localStorage.
const STORAGE_KEY = "cafeteria:carrinho";

// Lê o carrinho salvo no navegador.
function lerCarrinho() {
  try {
     // Recupera o texto salvo e converte de JSON para uma lista.
    // Se ainda não houver carrinho, usa uma lista vazia.
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // Confere se os dados são realmente uma lista.
    return Array.isArray(dados) ? dados : [];
  } catch {
       // Se os dados estiverem inválidos, começa com um carrinho vazio.
    return [];
  }
}
// Salva a lista atualizada do carrinho no navegador.
function salvarCarrinho(carrinho) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
   // Atualiza o número mostrado ao lado do link do carrinho.
  atualizarContadorCarrinho();
}

// Disponibiliza essa função para a tela de produtos poder adicionar cafés.
window.adicionarAoCarrinho = function (cafe) {
   // Recupera os itens que já estão no carrinho.
  const carrinho = lerCarrinho();

   // Procura se o café já foi adicionado.
  const existente = carrinho.find((item) => String(item.id) === String(cafe.id));
  if (existente) {
     // Se o café já estiver no carrinho, aumenta sua quantidade.
    existente.quantity += 1;
      // Atualiza a imagem do produto.
    existente.image = cafe.image;
  } else {
      // Se for um café novo, adiciona ao carrinho com quantidade inicial 1.
    carrinho.push({
      id: cafe.id,
      title: cafe.title,
      price: Number(cafe.price),
      image: cafe.image,
      quantity: 1,
    });
  }
    // Salva o carrinho atualizado e atualiza o contador.
  salvarCarrinho(carrinho);
};
// Monta e exibe a tela do carrinho.
function renderizarCarrinho() {
   // Cria a navegação e a área principal da página.
  const main = montarBase();
  // Adiciona o título da tela.
  main.append(criarElemento("h1", "mb-4", "Seu carrinho"));
  // Recupera os itens salvos no carrinho.
  const carrinho = lerCarrinho();
   // Se não houver itens, mostra uma mensagem e um link para voltar aos cafés.
  if (!carrinho.length) {
    main.append(criarElemento("p", "", "Seu carrinho está vazio."));

    const voltar = criarElemento("a", "btn btn-primary", "Ver cafés");

    voltar.href = "#inicio";
    main.append(voltar);
    return;
  }
   // Cria a lista visual onde cada produto será exibido.
  const lista = criarElemento("div", "list-group mb-4");
   // Cria uma linha da tela para cada item do carrinho.
  carrinho.forEach((item) => {
    const linha = criarElemento("div", "list-group-item d-flex flex-wrap align-items-center gap-3");
     // Mostra o nome e a quantidade/preço unitário do produto.
    const nome = criarElemento("strong", "me-auto", item.title);
    const quantidade = criarElemento("span", "", `${item.quantity} × ${moeda(item.price)}`);
      // Agrupa os botões de controle da quantidade.
    const controles = criarElemento("div", "btn-group");
      // Botão para diminuir a quantidade em uma unidade.
    const diminuir = criarElemento("button", "btn btn-outline-secondary", "−");
    diminuir.type = "button";
    diminuir.setAttribute("aria-label", `Diminuir ${item.title}`);
    diminuir.addEventListener("click", () => alterarQuantidade(item.id, -1));

    // Botão para aumentar a quantidade em uma unidade.
    const aumentar = criarElemento("button", "btn btn-outline-secondary", "+");
    aumentar.type = "button";
    aumentar.setAttribute("aria-label", `Aumentar ${item.title}`);
    aumentar.addEventListener("click", () => alterarQuantidade(item.id, 1));

      // Botão para remover o produto do carrinho.
    const remover = criarElemento("button", "btn btn-outline-danger", "Remover");
    remover.type = "button";
    remover.addEventListener("click", () => removerItem(item.id));

     // Coloca os botões dentro do grupo de controles.
    controles.append(diminuir, aumentar, remover);
     // Mostra nome, quantidade, subtotal e controles na linha do produto.
    linha.append(nome, quantidade, criarElemento("strong", "", moeda(item.price * item.quantity)), controles);
       // Coloca a linha do produto dentro da lista.
    lista.append(linha);
  });
  // Exibe a lista de produtos na página.
  main.append(lista);
  // Soma o subtotal de todos os produtos para calcular o total do carrinho.
  const total = carrinho.reduce((soma, item) => soma + item.price * item.quantity, 0);
    // Mostra o valor total formatado como moeda.
  main.append(criarElemento("p", "fs-4 fw-bold text-end", `Total: ${moeda(total)}`));
  // Cria o link para seguir até a tela de checkout.
  const checkout = criarElemento("a", "btn btn-primary", "Ir para checkout");
  checkout.href = "#checkout";
  main.append(checkout);
}
// Altera a quantidade de um produto no carrinho.
function alterarQuantidade(id, delta) {
  // Cria uma lista atualizada, mudando apenas o produto com o id recebido.
  const atualizado = lerCarrinho().map((item) => String(item.id) === String(id)
    ? { ...item, quantity: item.quantity + delta }
    : item)
      // Remove da lista qualquer produto cuja quantidade chegou a zero.
    .filter((item) => item.quantity > 0);
    
  salvarCarrinho(atualizado);
  // Atualiza a tela para mostrar as novas quantidades e o novo total.
  renderizarCarrinho();
}

function removerItem(id) {
    // Cria uma lista sem o produto escolhido e salva essa lista.
  salvarCarrinho(lerCarrinho().filter((item) => String(item.id) !== String(id)));
    // Atualiza a tela para refletir a remoção.
  renderizarCarrinho();
}
