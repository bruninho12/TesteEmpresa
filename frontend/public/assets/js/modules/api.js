const API_BASE_URL = "http://localhost:3001/api";

// Funcionários API
export async function getFuncionarios() {
  const response = await fetch(`${API_BASE_URL}/funcionarios`);
  if (!response.ok) throw new Error("Falha ao carregar funcionários");
  return await response.json();
}

export async function addFuncionario(funcionario) {
  const response = await fetch(`${API_BASE_URL}/funcionarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(funcionario),
  });
  if (!response.ok) throw new Error("Falha ao cadastrar funcionário");
  return await response.json();
}

export async function updateFuncionario(id, funcionario) {
  const response = await fetch(`${API_BASE_URL}/funcionarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(funcionario),
  });
  if (!response.ok) throw new Error("Falha ao atualizar funcionário");
  return await response.json();
}

export async function getFuncionariosHistorico() {
  const response = await fetch(`${API_BASE_URL}/funcionarios/historico`);
  if (!response.ok)
    throw new Error("Falha ao carregar histórico de funcionários");
  return await response.json();
}

export async function getFuncionario(id) {
  const response = await fetch(`${API_BASE_URL}/funcionarios/${id}`);
  if (!response.ok) throw new Error("Falha ao carregar dados do funcionário");
  return await response.json();
}

// Tickets API
export async function getTickets() {
  const response = await fetch(`${API_BASE_URL}/tickets`);
  if (!response.ok) throw new Error("Falha ao carregar tickets");
  return await response.json();
}

export async function addTicket(ticket) {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });
  if (!response.ok) throw new Error("Falha ao criar ticket");
  return await response.json();
}

// Relatórios API
export async function getRelatorios(type, params = {}) {
  let url = `${API_BASE_URL}/relatorios/${type}`;
  const queryParams = [];
  
  if (params.funcionarioId) queryParams.push(`funcionarioId=${params.funcionarioId}`);
  if (params.status) queryParams.push(`status=${params.status}`);
  // Campo de tipo de ticket removido
  if (params.inicio) queryParams.push(`inicio=${params.inicio}`);
  if (params.fim) queryParams.push(`fim=${params.fim}`);

  const response = await fetch(url + (queryParams.length ? `?${queryParams.join('&')}` : ''));
  if (!response.ok) throw new Error("Falha ao carregar relatório");
  return await response.json();
}
