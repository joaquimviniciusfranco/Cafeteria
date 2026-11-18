// Monta a tela de checkout. É async porque espera os dados da API.
async function renderizarCheckout() {
  // Prepara a navegação e a área principal da página.
  const main = montarBase();
    // Lê do localStorage os itens que estão no carrinho.
  const carrinho = lerCarrinho();
  // Mostra o título do checkout.
  main.append(criarElemento("h1", "mb-4", "Finalizar pedido"));
   // Se o carrinho estiver vazio, avisa e encerra a função.
  if (!carrinho.length) {
    main.append(criarElemento("p", "", "Adicione pelo menos um café antes de finalizar o pedido."));
    return;
  }

  // Recupera as imagens também para itens que já estavam salvos antes da mudança.
  try {
    const cafes = await buscarCafes();
     // Para cada item do carrinho, procura o produto correspondente na API.
      carrinho.forEach((item) => {
        const cafe = cafes.find((produto) => String(produto.id) === String(item.id));
         // Se o item ainda não tiver imagem, copia a imagem encontrada na API.
        if (!item.image && cafe) item.image = cafe.image;
      });
      // Salva no localStorage as imagens recuperadas.
      salvarCarrinho(carrinho);
  } catch {
    // O resumo continua sendo exibido caso a API esteja indisponível.
  }

  // Exibe os produtos que serão pedidos antes de a pessoa confirmar a compra.
  main.append(criarElemento("h2", "h4 mb-3", "Resumo dos produtos"));
   // Cria uma lista para exibir cada produto.
  const listaProdutos = criarElemento("div", "list-group mb-4");
  // Percorre os itens e monta uma linha para cada produto do carrinho.
  carrinho.forEach((item) => {
    const linha = criarElemento("div", "list-group-item d-flex flex-wrap align-items-center gap-3");
      
    // Se o produto tiver imagem, cria e configura o elemento da imagem.

    if (item.image) {
      const imagem = criarElemento("img", "rounded");
      imagem.src = item.image;
      imagem.alt = item.title;
      imagem.style.width = "90px";
      imagem.style.height = "70px";
      imagem.style.objectFit = "cover";
      linha.append(imagem);
    }
       // Exibe o nome, a quantidade, o preço unitário e o subtotal do produto.

    linha.append(
      criarElemento("strong", "me-auto", item.title),
      criarElemento("span", "", `${item.quantity} × ${moeda(item.price)}`),
      criarElemento("strong", "", moeda(item.price * item.quantity)),
    );
    // Coloca a linha do produto dentro da lista.
    listaProdutos.append(linha);
  });
    // Mostra a lista de produtos no checkout.
  main.append(listaProdutos);
 // Soma os subtotais dos itens para calcular o total do pedido.
  const resumo = carrinho.reduce((soma, item) => soma + item.price * item.quantity, 0);
   // Exibe o total formatado como valor em reais.
  main.append(criarElemento("p", "fs-4 fw-bold text-end mb-4", `Total do pedido: ${moeda(resumo)}`));
   // Cria o formulário de endereço e pagamento
  const form = criarElemento("form", "row g-3");
  // Cria o campo de endereço de entrega.
  const endereco = criarElemento("input", "form-control");
  endereco.id = "endereco";
  endereco.name = "endereco";
  endereco.required = true;
  endereco.minLength = 8;
  endereco.autocomplete = "street-address";
  // Cria o rótulo do campo de endereço e associa ao input pelo id.
  const rotuloEndereco = criarElemento("label", "form-label", "Endereço de entrega");
  rotuloEndereco.htmlFor = endereco.id;
  
  // Agrupa o rótulo e o campo de endereço.
  const grupoEndereco = criarElemento("div", "col-12");
  grupoEndereco.append(rotuloEndereco, endereco);
  const pagamento = criarElemento("select", "form-select");
  pagamento.name = "pagamento";
  pagamento.required = true;
  // Adiciona a opção inicial, que pede para a pessoa escolher.
  const opcaoInicial = criarElemento("option", "", "Selecione uma forma de pagamento");
  opcaoInicial.value = "";
  pagamento.append(opcaoInicial);
   // Cria as opções de pagamento disponíveis.
  [["pix", "Pix"], ["cartao", "Cartão"], ["dinheiro", "Dinheiro"]].forEach(([valor, rotulo]) => {
    const opcao = criarElemento("option", "", rotulo);
    opcao.value = valor;
    pagamento.append(opcao);
  });
   // Cria o rótulo da forma de pagamento e associa ao select.
  const rotuloPagamento = criarElemento("label", "form-label", "Forma de pagamento");
  rotuloPagamento.htmlFor = pagamento.name;
  pagamento.id = pagamento.name;

  // Agrupa o rótulo e o menu de pagamento.
  const grupoPagamento = criarElemento("div", "col-12 col-md-6");
  grupoPagamento.append(rotuloPagamento, pagamento);
   // Cria o botão que envia o formulário.
  const enviar = criarElemento("button", "btn btn-success", "Confirmar pedido");
  enviar.type = "submit";
    // Coloca os campos e um espaço para o botão dentro do formulário.
  form.append(grupoEndereco, grupoPagamento, criarElemento("div", "col-12"));

  // Coloca o botão dentro do último espaço criado.
  form.lastElementChild.append(enviar);
   // Define o que acontece quando o formulário é enviado.
  form.addEventListener("submit", (evento) => {
    // Impede o navegador de recarregar a página ao enviar o formulário.
    evento.preventDefault();
     
    // Verifica se os campos obrigatórios estão válidos.
    if (!form.reportValidity()) return;
      // Gera um número simples para identificar o pedido confirmado.
    const numeroPedido = Math.floor(Date.now() / 1000).toString().slice(-6);

    // Esvazia o carrinho salvo no localStorage.
    salvarCarrinho([]);

    // Limpa o conteúdo principal e mostra a confirmação do pedido.
    main.replaceChildren(criarElemento("h1", "text-success mb-3", "Pedido confirmado!"));

      // Mostra o número do pedido e o endereço informado.
    main.append(criarElemento("p", "", `Pedido #${numeroPedido} recebido. Entregaremos em: ${endereco.value.trim()}.`));
     // Cria um link para voltar à página inicial.
    const voltar = criarElemento("a", "btn btn-primary", "Voltar à cafeteria");
    voltar.href = "#inicio";
    main.append(voltar);
  });
   // Adiciona o formulário completo à tela.
  main.append(form);
}
