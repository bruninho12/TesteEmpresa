export const funcionariosView = `
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
            <input type="text" id="funcionario-cpf" class="form-control" 
                   pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" 
                   placeholder="000.000.000-00" required>
            <small class="form-text text-muted">Formato: 000.000.000-00</small>
          </div>
        </div>

        <div class="form-group">
          <label>Situação:</label>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="funcionario-situacao" id="funcionario-ativo" value="A" checked>
            <label class="form-check-label" for="funcionario-ativo">Ativo</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="funcionario-situacao" id="funcionario-inativo" value="I">
            <label class="form-check-label" for="funcionario-inativo">Inativo</label>
          </div>
        </div>

        <div id="funcionario-info" class="mb-3" style="display: none;">
          <div class="row">
            <div class="col-md-4">
              <p><strong>Código:</strong> <span id="funcionario-codigo"></span></p>
            </div>
            <div class="col-md-4">
              <p><strong>Situação:</strong> <span id="funcionario-situacao">Ativo</span></p>
            </div>
            <div class="col-md-4">
              <p><strong>Cadastrado em:</strong> <span id="funcionario-data-criacao"></span></p>
            </div>
            <div class="col-md-4">
              <p><strong>Última alteração:</strong> <span id="funcionario-data-alteracao"></span></p>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Salvar</button>
        <button type="button" id="cancel-edit-btn" class="btn btn-secondary" style="display:none; margin-left: 10px;">Cancelar</button>
      </form>
    </div>
    <div class="table-container">
      <h3>Funcionários Cadastrados</h3>
      <table id="funcionarios-table" class="table table-striped">
        <thead class="thead-dark">
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </section>
`;

export const ticketsView = `
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
        <p><strong>Situação:</strong> <span id="ticket-situacao">Ativo</span></p>
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
            <th>Situação Funcionário</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </section>
`;

export const relatoriosView = `
  <section id="relatorio-section">
    <h2>Relatórios</h2>
    
    <div id="relatorio-resumo" style="display: none; margin-bottom: 20px;">
      <h4>Resumo de Tickets</h4>
      <div>
        <strong>Total de Tickets:</strong> <span id="total-tickets">0</span>
      </div>
    </div>
    <div class="report-section">
      <h3>Relatório Detalhado</h3>
      <form id="relatorio-form">
        <div class="form-relatorio">
          <div class="form-group col-md-3">
            <label for="relatorio-funcionario">Funcionário:</label>
            <select id="relatorio-funcionario" class="form-control">
              <option value="">Todos</option> 
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="relatorio-status">Status:</label>
            <select id="relatorio-status" class="form-control">
              <option value="">Todos</option>
              <option value="A">Ativo</option>
              <option value="I">Inativo</option>
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="relatorio-inicio">Data Início:</label>
            <input type="date" id="relatorio-inicio" class="form-control">
          </div>
          <div class="form-group col-md-2">
            <label for="relatorio-fim">Data Fim:</label>
            <input type="date" id="relatorio-fim" class="form-control">
          </div>
          <div class="form-group col-md-1 d-flex align-items-end">
            <button type="submit" class="btn btn-filtrar">Filtrar</button>
          </div>
        </div>
      </form>
      
      <div class="table-responsive mt-3">
        <table id="relatorio-detalhado" class="table table-striped">
          <thead class="thead-dark">
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>Quantidade</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </section>
`;

export const historicoFuncionariosView = `
  <section>
    <h2>Histórico de Funcionários</h2>
    <div class="table-container">
      <table id="funcionarios-historico-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </section>
`;

// Configuração de navegação
export function setupNavigation(appController) {
  const navContainer = document.getElementById("nav-container");
  if (navContainer) {
    const historyLink = document.createElement("a");
    historyLink.href = "#";
    historyLink.className = "nav-link";
    historyLink.id = "nav-historicoFuncionarios";
    historyLink.innerText = "Histórico de Funcionários";
    historyLink.addEventListener("click", (e) => {
      e.preventDefault();
      appController.loadView("historicoFuncionarios");
    });
    navContainer.appendChild(historyLink);
  }
}
