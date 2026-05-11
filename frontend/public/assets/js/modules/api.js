// api.js

const API_URL = "http://localhost:3000/api";

export async function getProdutos() {
  const response = await fetch(`${API_URL}/produtos`);
  if (!response.ok) throw new Error("Erro ao buscar produtos");
  return await response.json();
}

export async function getPedidos() {
  const response = await fetch(`${API_URL}/pedidos`);
  if (!response.ok) throw new Error("Erro ao buscar pedidos");
  return await response.json();
}

export async function addPedido(pedido) {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  if (!response.ok) throw new Error("Erro ao salvar pedido");
  return await response.json();
}

export async function updatePedidoStatus(id, status) {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Erro ao atualizar status");
  return await response.json();
}
