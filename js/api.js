// comunicando com a api local
async function buscarCafes() {
  const resposta = await fetch("http://localhost:3000/cafes");


  if (!resposta.ok) {
    throw new Error("Nao foi possível buscar os cafes.");
  }

  return await resposta.json();
}
