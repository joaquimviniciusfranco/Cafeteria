const root = document.getElementById("root");


const principal = document.createElement("main");
principal.classname = "container py-5"
root.appendChild(principal);

const titulo = document.createElement("h1");
titulo.textContent = "Cafes"
titulo.className = "text-center mb-4";
principal.appendChild(titulo);

// Classe row Organiza as colunas//
const lista = document.createElement("div");
lista.className = "row g-4";
principal.appendChild(lista);

function criarCartao(cafe){
    const coluna = document.createElement("div");
    coluna.className = "col-12 col-md-6 col -lg-4"
}

