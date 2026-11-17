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
    const cafes = await buscarCafes();
      carrinho.forEach((item) => {
        const cafe = cafes.find((produto) => String(produto.id) === String(item.id));
        if (!item.image && cafe) item.image = cafe.image;
      });
      salvarCarrinho(carrinho);
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
