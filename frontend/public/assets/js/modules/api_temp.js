const API_BASE_URL = 'http://localhost:3001/api';

// Funcionários API
export async function getFuncionarios() {
  const response = await fetch(`${API_BASE_URL}/funcionarios`);
  if (!response.ok) throw new Error('Falha ao carregar funcionários');
  return await response.json();
}

// Nova função para obter funcionários ativos
export async function getFuncionariosAtivos() {
  const response = await fetch(`${API_BASE_URL}/funcionarios?situacao=A`);
  if (!response.ok) throw new Error('Falha ao carregar funcionários ativos');
  return await response.json();
}

// Tickets API
export async function getTickets() {
  const response = await fetch(`${API_BASE_URL}/tickets`);
  if (!response.ok) throw new Error('Falha ao carregar tickets');
  return await response.json();
}

// Resto do código existente...
