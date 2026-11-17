// Página inicial e navegação entre as telas.
const root = document.getElementById("root");

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

  // Busca os cafés usando a função do arquivo api.js.
  const cafes = await buscarCafes();

  // Cria um cartão para cada café recebido.
  cafes.forEach((cafe) => {
    lista.append(criarCartao(cafe));
  });
}

function navegar() {
  const rota = location.hash.slice(1);
  if (rota === "carrinho") renderizarCarrinho();
  else if (rota === "checkout") renderizarCheckout();
  else renderizarInicio();
}

window.addEventListener("hashchange", navegar);
navegar();
