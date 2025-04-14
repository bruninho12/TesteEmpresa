import * as api from "./api.js";
import { showAlert, formatCPF, formatDate } from "./utils.js";

// Funcionários Handlers
export function setupFuncionariosHandlers(funcionarios) {
  const form = document.getElementById("funcionario-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const formData = {
          nome: document.getElementById("funcionario-nome").value,
          cpf: document
            .getElementById("funcionario-cpf")
            .value.replace(/\D/g, ""),
          situacao: document.querySelector(
            'input[name="funcionario-situacao"]:checked'
          ).value,
        };

        const id = document.getElementById("funcionario-id").value;
        const result = id
          ? await api.updateFuncionario(id, formData)
          : await api.addFuncionario(formData);

        showAlert("Funcionário salvo com sucesso!");
      } catch (error) {
        showAlert(error.message, "danger");
      }
    });
  }

  // Render table
  const tableBody = document.querySelector("#funcionarios-table tbody");
  if (tableBody) {
    tableBody.innerHTML = funcionarios
      .map(
        (func) => `
      <tr>
        <td>${func.codigo}</td>
        <td>${func.nome}</td>
        <td>${formatCPF(func.cpf)}</td>
        <td><span class="badge ${
          func.situacao === "A" ? "bg-success" : "bg-secondary"
        }">
          ${func.situacao === "A" ? "Ativo" : "Inativo"}
        </span></td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-id="${func.id}" 
                  data-nome="${func.nome}" 
                  data-cpf="${func.cpf}"
                  data-situacao="${func.situacao}">
            Editar
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const form = document.getElementById("funcionario-form");
        form.reset();

        document.getElementById("funcionario-id").value = btn.dataset.id;
        document.getElementById("funcionario-nome").value = btn.dataset.nome;
        document.getElementById("funcionario-cpf").value = btn.dataset.cpf;

        // Set the correct radio button based on current status
        if (btn.dataset.situacao === "A") {
          document.getElementById("funcionario-ativo").checked = true;
        } else {
          document.getElementById("funcionario-inativo").checked = true;
        }

        // Show current employee info
        document.getElementById("funcionario-info").style.display = "block";
        // Get full employee data for additional fields
        const funcionario = await api.getFuncionario(btn.dataset.id);

        document.getElementById("funcionario-codigo").textContent =
          btn.parentElement.parentElement.cells[0].textContent;
        document.getElementById("funcionario-situacao").textContent =
          btn.dataset.situacao === "A" ? "Ativo" : "Inativo";
        document.getElementById("funcionario-situacao").className = `badge ${
          btn.dataset.situacao === "A" ? "badge-success" : "badge-secondary"
        }`;
        document.getElementById("funcionario-data-criacao").textContent =
          formatDate(funcionario.dataCriacao);
        document.getElementById("funcionario-data-alteracao").textContent =
          formatDate(funcionario.dataAlteracao);
      });
    });
  }
}

// Tickets Handlers
export async function setupTicketsHandlers(tickets) {
  const funcionarioSelect = document.getElementById("ticket-funcionario");
  if (funcionarioSelect) {
    try {
      const funcionarios = await api.getFuncionarios();
      funcionarioSelect.innerHTML = funcionarios
        .filter((f) => f.situacao === "A")
        .map((f) => `<option value="${f.id}">${f.codigo} - ${f.nome}</option>`)
        .join("");
    } catch (error) {
      showAlert("Falha ao carregar funcionários: " + error.message, "danger");
    }
  }

  const form = document.getElementById("ticket-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const funcionarioId =
          document.getElementById("ticket-funcionario").value;
        const quantidade = document.getElementById("ticket-quantidade").value;

        if (!quantidade || quantidade <= 0) {
          throw new Error("Quantidade deve ser maior que zero");
        }

        const formData = {
          funcionarioId,
          quantidade: parseInt(quantidade),
          situacao: "A",
        };

        const result = await api.addTicket(formData);
        showAlert("Ticket registrado com sucesso!");
        form.reset();
      } catch (error) {
        showAlert(error.message, "danger");
      }
    });
  }

  // Tabela de renderização
  const tableBody = document.querySelector("#tickets-table tbody");
  if (tableBody) {
    tableBody.innerHTML = tickets
      .map(
        (ticket) => `
      <tr>
        <td>${ticket.codigoFuncionario}</td>
        <td>${ticket.funcionario.nome}</td>
        <td>${ticket.quantidade}</td>
        <td><span class="badge ${
          ticket.situacao === "A" ? "bg-success" : "bg-secondary"
        }">
          ${ticket.situacao === "A" ? "Ativo" : "Inativo"}
        </span></td>
        <td>${formatDate(ticket.dataModificacao)}</td>
      </tr>
    `
      )
      .join("");
  }
}

// Histórico de Funcionários Handlers
export async function setupHistoricoFuncionariosHandlers() {
  try {
    console.log("Iniciando carregamento do histórico de funcionários...");
    const funcionarios = await api.getFuncionariosHistorico();
    console.log("Dados recebidos da API:", funcionarios);

    const tableBody = document.querySelector(
      "#funcionarios-historico-table tbody"
    );

    if (!tableBody) {
      console.error("Elemento tbody não encontrado");
      return;
    }

    if (!funcionarios || funcionarios.length === 0) {
      console.warn("Nenhum funcionário retornado pela API");
      tableBody.innerHTML = `<tr><td colspan="4">Nenhum funcionário encontrado</td></tr>`;
      return;
    }

    console.log(`Renderizando ${funcionarios.length} funcionários`);
    tableBody.innerHTML = funcionarios
      .map(
        (func) => `
        <tr>
          <td>${func.nome}</td>
          <td>${formatCPF(func.cpf)}</td>
          <td><span class="badge ${
            func.situacao === "A" ? "bg-success" : "bg-secondary"
          }">
            ${func.situacao === "A" ? "Ativo" : "Inativo"}
          </span></td>
          <td>
            <button class="btn btn-sm btn-primary btn-edit" 
                    data-id="${func.id}"
                    data-nome="${func.nome}"
                    data-cpf="${func.cpf}"
                    data-situacao="${func.situacao}">
              Editar
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    console.log("Adicionando handlers para botões de edição...");
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("Editando funcionário:", btn.dataset.id);
        document.getElementById("funcionario-id").value = btn.dataset.id;
        document.getElementById("funcionario-nome").value = btn.dataset.nome;
        document.getElementById("funcionario-cpf").value = btn.dataset.cpf;

        if (btn.dataset.situacao === "A") {
          document.getElementById("funcionario-ativo").checked = true;
        } else {
          document.getElementById("funcionario-inativo").checked = true;
        }

        document.getElementById("funcionario-info").style.display = "block";
        document.getElementById("funcionario-situacao").textContent =
          btn.dataset.situacao === "A" ? "Ativo" : "Inativo";
        document.getElementById("funcionario-situacao").className = `badge ${
          btn.dataset.situacao === "A" ? "badge-success" : "badge-secondary"
        }`;

        document.getElementById("funcionario-form").scrollIntoView();
      });
    });

    console.log("Histórico de funcionários carregado com sucesso");
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    showAlert(
      "Falha ao carregar histórico de funcionários: " + error.message,
      "danger"
    );
  }
}

// Relatórios Handlers
export async function setupRelatoriosHandlers() {
  const funcionarioSelect = document.getElementById("relatorio-funcionario");
  if (funcionarioSelect) {
    try {
      const funcionarios = await api.getFuncionarios();
      funcionarioSelect.innerHTML = funcionarios
        .map((f) => `<option value="${f.id}">${f.codigo} - ${f.nome}</option>`)
        .join("");
    } catch (error) {
      showAlert("Falha ao carregar funcionários: " + error.message, "danger");
    }
  }

  const form = document.getElementById("relatorio-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const funcionarioId =
          document.getElementById("relatorio-funcionario").value === ""
            ? "todos"
            : document.getElementById("relatorio-funcionario").value;
        const status = document.getElementById("relatorio-status").value;
        const inicio = document.getElementById("relatorio-inicio").value;
        const fim = document.getElementById("relatorio-fim").value;

        // Construir parâmetros de consulta
        const params = {
          funcionarioId: funcionarioId || undefined,
          status: status || undefined,
          inicio: inicio || undefined,
          fim: fim || undefined,
        };

        const response = await api.getRelatorios("detalhado", params);

        const tableBody = document.querySelector("#relatorio-detalhado tbody");
        const summarySection = document.getElementById("relatorio-resumo");

        if (response.summary) {
          summarySection.style.display = "block";
          document.getElementById("total-tickets").textContent = response.total;

          // Renderizar tabela de resumo por funcionário
          tableBody.innerHTML = response.summary
            .map(
              (item) => `
                <tr>
                  <td>${item.funcionario.nome}</td>
                  <td>${item.funcionario.codigo}</td>
                  <td>${item.totalTickets}</td>
                </tr>
              `
            )
            .join("");
        } else {
          // Modo detalhado (funcionário específico)
          summarySection.style.display = "none";
          tableBody.innerHTML = response
            .map(
              (ticket) => `
                <tr>
                  <td>${formatDate(ticket.dataModificacao)}</td>
                  <td>${ticket.funcionario.nome}</td>
                  <td>${ticket.quantidade}</td>
                  <td><span class="badge ${
                    ticket.situacao === "A"
                      ? "badge-success"
                      : "badge-secondary"
                  }">
                    ${ticket.situacao === "A" ? "Ativo" : "Inativo"}
                  </span></td>
                </tr>
              `
            )
            .join("");
        }
      } catch (error) {
        showAlert(error.message, "danger");
      }
    });
  }
}
