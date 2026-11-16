const root = document.getElementById("root");
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

function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");
  if (contador) contador.textContent = lerCarrinho().reduce((soma, item) => soma + item.quantity, 0);
}

// Contrato para a tela de produtos: chamar window.adicionarAoCarrinho(cafe).
// Produto recebido no formato de db.json: { id, title, description, price }.
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

function moeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

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

function criarCartao(cafe) {
  const coluna = criarElemento("div", "col-12 col-md-6 col-lg-4");

  const cartao = criarElemento("article", "card h-100 shadow-sm");

  // Cria a imagem do café.
  const imagem = criarElemento("img", "card-img-top");
  imagem.src = cafe.image;
  imagem.alt = cafe.title;
  imagem.style.height = "220px";
  imagem.style.objectFit = "cover";

  const corpo = criarElemento(
    "div",
    "card-body d-flex flex-column"
  );

  // Transforma a lista de ingredientes em texto.
  const ingredientes = criarElemento(
    "p",
    "card-text",
    "Ingredientes: " + cafe.ingredients.join(", ")
  );

  corpo.append(
    criarElemento("h2", "h5 card-title", cafe.title),
    criarElemento("p", "card-text text-muted", cafe.description),
    ingredientes,
    criarElemento("p", "fw-bold mt-auto", moeda(cafe.price))
  );

  const botao = criarElemento(
    "button",
    "btn btn-primary",
    "Adicionar ao carrinho"
  );

  botao.type = "button";

  botao.addEventListener("click", () => {
    window.adicionarAoCarrinho(cafe);

    botao.textContent = "Adicionado!";

    setTimeout(() => {
      botao.textContent = "Adicionar ao carrinho";
    }, 900);
  });

  corpo.append(botao);

  // Coloca a imagem antes do corpo do cartão.
  cartao.append(imagem, corpo);

  coluna.append(cartao);

  return coluna;
}



async function renderizarInicio() {
  const main = montarBase();

  main.append(
    criarElemento("h1", "text-center mb-4", "Nossos cafés")
  );

  const lista = criarElemento("div", "row g-4");
  main.append(lista);

  // Busca os cafés na API.
  const resposta = await fetch("http://localhost:3000/cafes");

  // Transforma a resposta em dados que o JavaScript consegue usar.
  const cafes = await resposta.json();

  // Cria um cartão para cada café recebido.
  cafes.forEach((cafe) => {
    lista.append(criarCartao(cafe));
  });
}

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

async function renderizarCheckout() {
  const main = montarBase();
  const carrinho = lerCarrinho();
  main.append(criarElemento("h1", "mb-4", "Finalizar pedido"));
  if (!carrinho.length) {
    main.append(criarElemento("p", "", "Adicione pelo menos um café antes de finalizar o pedido."));
    return;
  }

  // Recupera as imagens também para itens que já estavam salvos antes da mudança.
  try {
    const resposta = await fetch("http://localhost:3000/cafes");
    if (resposta.ok) {
      const cafes = await resposta.json();
      carrinho.forEach((item) => {
        const cafe = cafes.find((produto) => String(produto.id) === String(item.id));
        if (!item.image && cafe) item.image = cafe.image;
      });
      salvarCarrinho(carrinho);
    }
  } catch {
    // O resumo continua sendo exibido caso a API esteja indisponível.
  }

  // Exibe os produtos que serão pedidos antes de a pessoa confirmar a compra.
  main.append(criarElemento("h2", "h4 mb-3", "Resumo dos produtos"));
  const listaProdutos = criarElemento("div", "list-group mb-4");
  carrinho.forEach((item) => {
    const linha = criarElemento("div", "list-group-item d-flex flex-wrap align-items-center gap-3");
    if (item.image) {
      const imagem = criarElemento("img", "rounded");
      imagem.src = item.image;
      imagem.alt = item.title;
      imagem.style.width = "90px";
      imagem.style.height = "70px";
      imagem.style.objectFit = "cover";
      linha.append(imagem);
    }
    linha.append(
      criarElemento("strong", "me-auto", item.title),
      criarElemento("span", "", `${item.quantity} × ${moeda(item.price)}`),
      criarElemento("strong", "", moeda(item.price * item.quantity)),
    );
    listaProdutos.append(linha);
  });
  main.append(listaProdutos);

  const resumo = carrinho.reduce((soma, item) => soma + item.price * item.quantity, 0);
  main.append(criarElemento("p", "fs-4 fw-bold text-end mb-4", `Total do pedido: ${moeda(resumo)}`));
  const form = criarElemento("form", "row g-3");
  const endereco = criarElemento("input", "form-control");
  endereco.id = "endereco";
  endereco.name = "endereco";
  endereco.required = true;
  endereco.minLength = 8;
  endereco.autocomplete = "street-address";
  const rotuloEndereco = criarElemento("label", "form-label", "Endereço de entrega");
  rotuloEndereco.htmlFor = endereco.id;
  const grupoEndereco = criarElemento("div", "col-12");
  grupoEndereco.append(rotuloEndereco, endereco);
  const pagamento = criarElemento("select", "form-select");
  pagamento.name = "pagamento";
  pagamento.required = true;
  const opcaoInicial = criarElemento("option", "", "Selecione uma forma de pagamento");
  opcaoInicial.value = "";
  pagamento.append(opcaoInicial);
  [["pix", "Pix"], ["cartao", "Cartão"], ["dinheiro", "Dinheiro"]].forEach(([valor, rotulo]) => {
    const opcao = criarElemento("option", "", rotulo);
    opcao.value = valor;
    pagamento.append(opcao);
  });
  const rotuloPagamento = criarElemento("label", "form-label", "Forma de pagamento");
  rotuloPagamento.htmlFor = pagamento.name;
  pagamento.id = pagamento.name;
  const grupoPagamento = criarElemento("div", "col-12 col-md-6");
  grupoPagamento.append(rotuloPagamento, pagamento);
  const enviar = criarElemento("button", "btn btn-success", "Confirmar pedido");
  enviar.type = "submit";
  form.append(grupoEndereco, grupoPagamento, criarElemento("div", "col-12"));
  form.lastElementChild.append(enviar);
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!form.reportValidity()) return;
    const numeroPedido = Math.floor(Date.now() / 1000).toString().slice(-6);
    salvarCarrinho([]);
    main.replaceChildren(criarElemento("h1", "text-success mb-3", "Pedido confirmado!"));
    main.append(criarElemento("p", "", `Pedido #${numeroPedido} recebido. Entregaremos em: ${endereco.value.trim()}.`));
    const voltar = criarElemento("a", "btn btn-primary", "Voltar à cafeteria");
    voltar.href = "#inicio";
    main.append(voltar);
  });
  main.append(form);
}

function navegar() {
  const rota = location.hash.slice(1);
  if (rota === "carrinho") renderizarCarrinho();
  else if (rota === "checkout") renderizarCheckout();
  else renderizarInicio();
}

window.addEventListener("hashchange", navegar);
navegar();
