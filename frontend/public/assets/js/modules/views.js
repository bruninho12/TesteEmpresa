export const totemView = `
  <section class="totem-container">
    <div class="header-totem text-center mb-4">
        <h2 class="fw-bold">Cardápio</h2>
        <nav class="nav nav-pills justify-content-center mt-3">
            <button class="nav-link active" onclick="window.filtrarCategoria('salgados')">Salgados</button>
            <button class="nav-link" onclick="window.filtrarCategoria('bebidas')">Bebidas</button>
            <button class="nav-link" onclick="window.filtrarCategoria('doces')">Doces</button>
        </nav>
    </div>

    <!-- Grid onde os produtos do Banco (MongoDB) serão injetados -->
    <div id="grid-produtos" class="produtos-grid">
        <div class="text-center w-100 p-5">
            <div class="spinner-border text-warning"></div>
            <p>Carregando delícias...</p>
        </div>
    </div>

    <!-- Botão Flutuante de Checkout (Estilo App Mobile/Totem) -->
    <div class="footer-checkout">
        <button class="btn btn-warning btn-lg shadow-lg fw-bold" onclick="window.appInstance.loadView('carrinho')">
            VER MEU PEDIDO (R$ <span id="total-flutuante">0,00</span>)
        </button>
    </div>
  </section>
`;

/**
 * TELA DE CHECKOUT (CARRINHO)
 */
export const carrinhoView = `
  <section class="checkout-container container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Meu pedido</h2>
        <button class="btn btn-link text-danger text-decoration-none" id="btn-limpar">Limpar tudo</button>
    </div>

    <div class="row">
      <!-- Lista de Itens Selecionados -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <ul id="lista-carrinho" class="list-group list-group-flush">
                <!-- Itens injetados pelo setupCarrinhoHandlers -->
            </ul>
        </div>
        <button class="btn btn-outline-dark mt-4" onclick="window.appInstance.loadView('totem')">
            + Adicionar mais itens
        </button>
      </div>

      <!-- Resumo de Valores e Finalização -->
      <div class="col-md-4">
        <div class="card p-4 shadow-sm border-0 rounded-4 bg-white">
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Subtotal</span>
                <span id="subtotal" class="fw-bold">R$ 0,00</span>
            </div>
            <div class="d-flex justify-content-between mb-4 h4">
                <strong>Total</strong>
                <strong id="total-pedido" class="text-dark">R$ 0,00</strong>
            </div>
            
            <button id="btn-finalizar" class="btn btn-warning btn-lg w-100 py-3 fw-bold rounded-3">
                PRÓXIMO (FINALIZAR)
            </button>
            
            <p class="text-center text-muted small mt-3">
                Ao clicar em próximo, seu pedido será enviado para a cozinha.
            </p>
        </div>
      </div>
    </div>
  </section>
`;

/**
 * MONITOR DA COZINHA
 */
export const cozinhaView = `
  <section class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4 bg-dark text-white p-3 rounded shadow">
        <h2 class="mb-0">👨‍🍳 Monitor de Produção</h2>
        <div class="spinner-grow text-success spinner-grow-sm"></div>
    </div>
    <div class="row" id="monitor-pedidos">
      <!-- Tickets de pedidos aparecem aqui -->
    </div>
  </section>
`;

/**
 * CADASTRO DE PRODUTOS (ADMIN)
 */
export const cadastroView = `
  <section class="container mt-4">
    <div class="card shadow-sm border-0 p-4 rounded-4">
      <h2 class="mb-4">📦 Gestão de Cardápio</h2>
      <form id="form-cadastro-produto">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label fw-bold">Nome do Lanche</label>
            <input type="text" id="prod-nome" class="form-control" placeholder="Ex: Big Mac" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label fw-bold">Preço (R$)</label>
            <input type="number" id="prod-preco" class="form-control" step="0.01" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label fw-bold">Categoria</label>
            <select id="prod-categoria" class="form-select">
              <option value="Salgados">Salgados</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Doces">Doces</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label for="arquivo" class="form-label fw-bold">Caminho da Imagem</label>
          <input type="file" id="prod-imagem" class="form-control">
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-100 mt-2">Salvar no Cardápio</button>
      </form>
    </div>
  </section>
`;

// Ajuste na navegação para os novos nomes de telas
export function setupNavigation(appController) {
  const links = {
    "nav-totem": "Fazer Pedido",
    "nav-carrinho": "Carrinho",
    "nav-cozinha": "Cozinha",
    "nav-vendas": "Relatório de Vendas",
    "nav-cadastro": "Cadastro de Produtos",
  };

  const navContainer = document.getElementById("nav-container");
  if (navContainer) {
    navContainer.innerHTML = ""; // Limpa os links antigos de funcionário

    Object.entries(links).forEach(([id, text]) => {
      const link = document.createElement("a");
      link.href = "#";
      link.className = "nav-link";
      link.id = id;
      link.innerText = text;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        appController.loadView(id.replace("nav-", ""));
      });
      navContainer.appendChild(link);
    });
  }
}
