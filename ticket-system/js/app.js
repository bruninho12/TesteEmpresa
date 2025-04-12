const { jsPDF } = window.jspdf;

// API Helper Function
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Intervalo para backups periódicos (5 minutos)
const BACKUP_INTERVAL = 5 * 60 * 1000;

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Verificar se os elementos de navegação existem
    if (
      document.getElementById("nav-funcionarios") &&
      document.getElementById("nav-tickets") &&
      document.getElementById("nav-relatorios")
    ) {
      setupNavigation();
      loadFuncionariosView();
    } else {
      console.error("Elementos de navegação não encontrados");
      setTimeout(() => {
        if (document.getElementById("nav-funcionarios")) {
          setupNavigation();
          loadFuncionariosView();
        }
      }, 500);
    }
  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);
    alert("Erro ao inicializar a aplicação. Por favor, recarregue a página.");
  }
});

// API Functions
async function getFuncionarios() {
  return apiFetch("/funcionarios");
}

async function addFuncionario(funcionario) {
  return apiFetch("/funcionarios", {
    method: "POST",
    body: JSON.stringify(funcionario),
  });
}

async function updateFuncionario(id, funcionario) {
  return apiFetch(`/funcionarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(funcionario),
  });
}

async function getTickets() {
  return apiFetch("/tickets");
}

async function addTicket(ticket) {
  console.log("Endpoint da API:", `/api/tickets`);
  console.log("Dados sendo enviados:", ticket);

  try {
    const response = await apiFetch("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    });
    console.log("Resposta da API:", response);
    return response;
  } catch (error) {
    console.error("Erro detalhado na requisição:", {
      message: error.message,
      status: error.status,
      data: error.data,
    });

    let errorMessage = "Erro ao registrar ticket";
    if (error.status === 500) {
      errorMessage += " - Erro interno no servidor";
    } else if (error.data && error.data.message) {
      errorMessage += `: ${error.data.message}`;
    }

    alert(errorMessage);
    throw error;
  }
}

// Report Functions
async function getTotalTickets() {
  return apiFetch("/relatorios/total");
}

async function getTicketsByFuncionario() {
  return apiFetch("/relatorios/funcionarios");
}

async function getTicketsByPeriodo(inicio, fim) {
  return apiFetch(`/relatorios/periodo?inicio=${inicio}&fim=${fim}`);
}

// Application Views
function loadFuncionariosView() {
  const appContent = document.getElementById("app-content");
  appContent.innerHTML = `
    <section>
      <h2>Gerenciar Funcionários</h2>
      <div class="form-container">
        <h3>Cadastrar/Editar Funcionário</h3>
        <form id="funcionario-form">
          <input type="hidden" id="funcionario-id">
          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="funcionario-nome">Nome:</label>
              <input type="text" id="funcionario-nome" class="form-control" required>
            </div>
            <div class="form-group col-md-6">
              <label for="funcionario-cpf">CPF:</label>
              <input type="text" id="funcionario-cpf" class="form-control" pattern="\d{11}" required>
              <small class="form-text text-muted">Apenas números (11 dígitos)</small>
            </div>
          </div>
          
          <div id="funcionario-info" class="mb-3" style="display: none;">
            <div class="row">
              <div class="col-md-4">
                <p><strong>Código:</strong> <span id="funcionario-codigo"></span></p>
              </div>
              <div class="col-md-4">
                <p><strong>Situação:</strong> <span id="funcionario-situacao" class="badge badge-success">Ativo</span></p>
              </div>
              <div class="col-md-4">
                <p><strong>Cadastrado em:</strong> <span id="funcionario-data-criacao"></span></p>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Salvar</button>
        </form>
      </div>
    </section>
  `;

  // Configurar evento de submit do formulário
  document
    .getElementById("funcionario-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const funcionario = {
        nome: document.getElementById("funcionario-nome").value,
        cpf: document.getElementById("funcionario-cpf").value,
      };

      try {
        await addFuncionario(funcionario);
        alert("Funcionário cadastrado com sucesso!");
        e.target.reset();
      } catch (error) {
        console.error("Erro ao cadastrar funcionário:", error);
        let errorMessage = "Erro ao cadastrar funcionário";

        if (error.status === 500) {
          errorMessage += " - Erro interno no servidor";
        } else if (error.data && error.data.message) {
          errorMessage += `: ${error.data.message}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }

        console.error("Detalhes do erro:", {
          status: error.status,
          data: error.data,
          message: error.message,
        });

        alert(errorMessage);
      }
    });
}

async function loadTicketsView() {
  try {
    const appContent = document.getElementById("app-content");
    appContent.innerHTML = `
        <section>
            <h2>Gerenciar Tickets</h2>
            <div class="form-container">
                <h3>Registrar Entrega de Tickets</h3>
                <form id="ticket-form">
                    <div class="form-group">
                        <label for="ticket-funcionario">Funcionário:</label>
                        <select id="ticket-funcionario" required></select>
                    </div>
                    <div class="form-group">
                        <label for="ticket-quantidade">Quantidade:</label>
                        <input type="number" id="ticket-quantidade" class="form-control" min="1" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Registrar</button>
                </form>
                <div id="ticket-info" class="mb-3" style="display: none;">
                    <p><strong>Situação:</strong> <span id="ticket-situacao" class="badge badge-success">Ativo</span></p>
                    <p><strong>Data de Entrega:</strong> <span id="ticket-data-entrega"></span></p>
                </div>
            </div>
            <div class="table-container">
                <h3>Histórico de Tickets</h3>
                <table id="tickets-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Funcionário</th>
                            <th>Quantidade</th>
                            <th>Situação</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `;

    // Carregar dropdown de funcionários
    await loadFuncionariosDropdown();

    // Configurar eventos do formulário
    document
      .getElementById("ticket-form")
      .addEventListener("submit", handleTicketSubmit);

    // Carregar lista de tickets
    await loadTicketsTable();
  } catch (error) {
    console.error("Erro ao carregar view de tickets:", error);
    alert("Erro ao carregar tickets. Verifique o console para mais detalhes.");
  }
}

async function loadFuncionariosDropdown() {
  const funcionarios = await getFuncionarios();
  const select = document.getElementById("ticket-funcionario");

  select.innerHTML = ""; // limpa o select antes de preencher

  funcionarios.forEach((func) => {
    const option = document.createElement("option");
    option.value = func.codigo;
    option.textContent = func.nome;
    select.appendChild(option);
  });
}

async function handleTicketSubmit(event) {
  event.preventDefault();

  console.log("Iniciando registro de ticket...");

  const select = document.getElementById("ticket-funcionario");
  const funcionarioId = select.value; // Já deve ser o ID do funcionário
  const quantidade = parseInt(
    document.getElementById("ticket-quantidade").value
  );

  if (!funcionarioId || isNaN(quantidade) || quantidade <= 0) {
    alert(
      "Por favor, selecione um funcionário e informe uma quantidade válida"
    );
    return;
  }

  const novoTicket = {
    funcionarioId: funcionarioId, // Envia o ID diretamente
    quantidade: quantidade,
  };

  console.log("Dados completos do ticket:", {
    ticket: novoTicket,
    funcionarios: await getFuncionarios(),
  });

  console.log("Dados do ticket a ser enviado:", novoTicket);

  try {
    console.log("Enviando ticket para o servidor...");
    const response = await addTicket(novoTicket);
    console.log("Resposta do servidor:", response);

    await loadTicketsTable(); // atualiza a tabela após o envio
    event.target.reset(); // limpa o formulário
    alert("Ticket registrado com sucesso!");
  } catch (error) {
    console.error("Erro ao registrar ticket:", error);
    alert("Erro ao registrar ticket. Verifique o console para mais detalhes.");
  }
}

async function loadTicketsTable() {
  const tickets = await getTickets();
  const funcionarios = await getFuncionarios();
  const tbody = document.querySelector("#tickets-table tbody");

  tbody.innerHTML = ""; // Limpa a tabela antes de preencher

  tickets.forEach((ticket) => {
    const func = funcionarios.find(
      (f) => f.codigo === ticket.codigoFuncionario
    );

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ticket.id}</td>
      <td>${func ? func.nome : "Desconhecido"}</td>
      <td>${ticket.quantidade}</td>
      <td>${ticket.situacao || "Entregue"}</td>
      <td>${new Date(ticket.data).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Relatórios View
async function loadRelatoriosView() {
  const appContent = document.getElementById("app-content");
  appContent.innerHTML = `
    <section>
      <h2>Relatórios</h2>
      
      <div class="report-section">
        <h3>Total de Tickets Entregues</h3>
        <div id="total-tickets" class="report-value">Carregando...</div>
      </div>
      
      <div class="report-section">
        <h3>Tickets por Funcionário</h3>
        <table id="funcionarios-report">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Total de Tickets</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      
      <div class="report-section">
        <h3>Consultar por Período</h3>
        <form id="periodo-form">
          <div class="form-group">
            <label for="data-inicio">Data Início:</label>
            <input type="date" id="data-inicio" required>
          </div>
          <div class="form-group">
            <label for="data-fim">Data Fim:</label>
            <input type="date" id="data-fim" required>
          </div>
          <button type="submit">Consultar</button>
        </form>
        <div id="periodo-result"></div>
      </div>
    </section>
  `;

  // Load initial data
  await loadTotalTickets();
  await loadFuncionariosReport();

  // Setup period form
  document
    .getElementById("periodo-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const inicio = document.getElementById("data-inicio").value;
      const fim = document.getElementById("data-fim").value;

      if (!inicio || !fim) {
        alert("Por favor, preencha ambas as datas");
        return;
      }

      try {
        const tickets = await getTicketsByPeriodo(inicio, fim);
        renderPeriodoResult(tickets);
      } catch (error) {
        console.error("Erro ao buscar tickets por período:", error);
        alert("Erro ao buscar dados. Verifique o console para mais detalhes.");
      }
    });
}

async function loadTotalTickets() {
  try {
    const data = await getTotalTickets();
    document.getElementById("total-tickets").textContent = data.totalTickets;
  } catch (error) {
    console.error("Erro ao carregar total de tickets:", error);
    document.getElementById("total-tickets").textContent = "Erro ao carregar";
  }
}

async function loadFuncionariosReport() {
  try {
    const data = await getTicketsByFuncionario();
    const tbody = document.querySelector("#funcionarios-report tbody");
    tbody.innerHTML = data
      .map(
        (item) => `
      <tr>
        <td>${item.funcionario}</td>
        <td>${item.totalTickets}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Erro ao carregar relatório por funcionário:", error);
  }
}

function renderPeriodoResult(tickets) {
  const container = document.getElementById("periodo-result");
  if (tickets.length === 0) {
    container.innerHTML =
      "<p>Nenhum ticket encontrado no período selecionado</p>";
    return;
  }

  container.innerHTML = `
    <h4>Resultados (${tickets.length} tickets)</h4>
    <table class="periodo-table">
      <thead>
        <tr>
          <th>Funcionário</th>
          <th>Quantidade</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${tickets
          .map(
            (ticket) => `
          <tr>
            <td>${ticket.funcionario.nome}</td>
            <td>${ticket.quantidade}</td>
            <td>${new Date(ticket.dataEntrega).toLocaleDateString()}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// Navigation Setup
function setupNavigation() {
  const navFuncionarios = document.getElementById("nav-funcionarios");
  const navTickets = document.getElementById("nav-tickets");
  const navRelatorios = document.getElementById("nav-relatorios");

  if (navFuncionarios) {
    navFuncionarios.addEventListener("click", (e) => {
      e.preventDefault();
      loadFuncionariosView();
    });
  }

  if (navTickets) {
    navTickets.addEventListener("click", (e) => {
      e.preventDefault();
      loadTicketsView();
    });
  }

  if (navRelatorios) {
    navRelatorios.addEventListener("click", (e) => {
      e.preventDefault();
      loadRelatoriosView();
    });
  }
}

// Restante das funções existentes (handleTicketSubmit, loadFuncionariosDropdown, loadTicketsTable, etc)
