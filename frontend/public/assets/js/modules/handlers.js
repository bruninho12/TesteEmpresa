import * as api from "./api.js";
import { showAlert } from "./utils.js";

/**
 * 🔹 ESTADO GLOBAL (COM PERSISTÊNCIA)
 */
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function calcularTotal() {
  return carrinho.reduce((acc, item) => acc + item.preco, 0);
}

/**
 * 🔹 UTIL
 */
function criarImagem(src, alt) {
  const img = document.createElement("img");
  img.src = src || "assets/img/default.png";
  img.alt = alt;
  img.onerror = () => {
    img.src = `https://placehold.co/150?text=${encodeURIComponent(alt)}`;
  };
  return img;
}

/**
 * 1. TELA DE SELEÇÃO (TOTEM)
 */
export async function setupTotemHandlers(produtos) {
  const gridProdutos = document.getElementById("grid-produtos");
  const totalFlutuante = document.getElementById("total-flutuante");

  function atualizarTotal() {
    if (totalFlutuante) {
      totalFlutuante.textContent = calcularTotal().toFixed(2);
    }
  }

  function adicionarAoCarrinho(prod) {
    carrinho.push(prod);
    salvarCarrinho();
    atualizarTotal();
    showAlert(`${prod.nome} adicionado!`, "success");
  }

  function renderizarProdutos(categoria = "todos") {
    const filtrados =
      categoria === "todos"
        ? produtos
        : produtos.filter(
            (p) => p.categoria?.toLowerCase() === categoria.toLowerCase(),
          );

    gridProdutos.innerHTML = "";

    filtrados.forEach((prod) => {
      const card = document.createElement("div");
      card.className = "produto-card shadow-sm";

      const img = criarImagem(prod.imagem, prod.nome);

      const container = document.createElement("div");
      container.className = "p-2";

      const titulo = document.createElement("h5");
      titulo.textContent = prod.nome;

      const preco = document.createElement("p");
      preco.className = "preco text-success fw-bold";
      preco.textContent = `R$ ${prod.preco.toFixed(2)}`;

      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-warning w-100 fw-bold";
      btn.textContent = "ADICIONAR";

      btn.addEventListener("click", () =>
        adicionarAoCarrinho({
          id: prod.id,
          nome: prod.nome,
          preco: prod.preco,
          imagem: prod.imagem,
        }),
      );

      container.appendChild(titulo);
      container.appendChild(preco);
      container.appendChild(btn);

      card.appendChild(img);
      card.appendChild(container);

      gridProdutos.appendChild(card);
    });
  }

  window.filtrarCategoria = (categoria) => {
    document.querySelectorAll("header .nav-link").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.innerText.toLowerCase() === categoria.toLowerCase(),
      );
    });

    renderizarProdutos(categoria);
  };

  renderizarProdutos();
  atualizarTotal();
}

/**
 * 2. TELA DE CARRINHO
 */
export async function setupCarrinhoHandlers() {
  const lista = document.getElementById("lista-carrinho");
  const subtotalElem = document.getElementById("subtotal");
  const totalElem = document.getElementById("total-pedido");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const btnLimpar = document.getElementById("btn-limpar");

  function renderizar() {
    if (!lista) return;

    lista.innerHTML = "";

    if (carrinho.length === 0) {
      lista.innerHTML = `<li class="text-center p-5">Seu carrinho está vazio.</li>`;
    } else {
      carrinho.forEach((item, index) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center border-0 border-bottom py-3";

        const left = document.createElement("div");
        left.className = "d-flex align-items-center";

        const img = criarImagem(item.imagem, item.nome);
        img.width = 50;
        img.classList.add("me-3");

        const info = document.createElement("div");
        info.innerHTML = `
          <h6 class="mb-0">${item.nome}</h6>
          <small class="text-muted">Unitário: R$ ${item.preco.toFixed(2)}</small>
        `;

        left.appendChild(img);
        left.appendChild(info);

        const right = document.createElement("div");
        right.className = "d-flex align-items-center";

        const valor = document.createElement("strong");
        valor.className = "me-3";
        valor.textContent = `R$ ${item.preco.toFixed(2)}`;

        const btnRemover = document.createElement("button");
        btnRemover.className = "btn btn-sm btn-outline-danger";
        btnRemover.textContent = "🗑️";

        btnRemover.addEventListener("click", () => {
          carrinho.splice(index, 1);
          salvarCarrinho();
          renderizar();
        });

        right.appendChild(valor);
        right.appendChild(btnRemover);

        li.appendChild(left);
        li.appendChild(right);

        lista.appendChild(li);
      });
    }

    const total = calcularTotal();
    subtotalElem.textContent = `R$ ${total.toFixed(2)}`;
    totalElem.textContent = `R$ ${total.toFixed(2)}`;
  }

  btnLimpar?.addEventListener("click", () => {
    carrinho = [];
    salvarCarrinho();
    renderizar();
  });

  btnFinalizar?.addEventListener("click", async () => {
    if (carrinho.length === 0) {
      return showAlert("Carrinho vazio!", "warning");
    }

    try {
      const senha = Date.now().toString().slice(-4);

      await api.addPedido({
        itens: carrinho,
        total: calcularTotal(),
        senha,
        status: "PENDENTE",
      });

      showAlert(`Pedido Confirmado! Senha: ${senha}`, "success");

      carrinho = [];
      salvarCarrinho();

      window.appInstance.loadView("totem");
    } catch (e) {
      showAlert("Erro ao finalizar pedido.");
    }
  });

  renderizar();
}

/**
 * 3. COZINHA
 */
export async function setupCozinhaHandlers(pedidos) {
  const container = document.getElementById("monitor-pedidos");

  async function atualizar(lista) {
    const ativos = lista.filter((p) => p.status !== "ENTREGUE");

    container.innerHTML = "";

    ativos.forEach((p) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-3";

      col.innerHTML = `
        <div class="card shadow-sm border-warning">
          <div class="card-header bg-warning">
            <strong>SENHA: ${p.senha}</strong>
          </div>
          <div class="card-body">
            <ul>${p.itens.map((i) => `<li>${i.nome}</li>`).join("")}</ul>
            <button class="btn btn-success w-100">PRONTO</button>
          </div>
        </div>
      `;

      const btn = col.querySelector("button");

      btn.addEventListener("click", async () => {
        await api.updatePedidoStatus(p.id, "PRONTO");
        const novos = await api.getPedidos();
        atualizar(novos);
      });

      container.appendChild(col);
    });
  }

  atualizar(pedidos);
}

/**
 * 4. CADASTRO
 */
export async function setupCadastroHandlers() {
  const form = document.getElementById("form-cadastro-produto");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("prod-imagem");
    const file = fileInput.files[0];

    if (!file) {
      return alert("Selecione uma imagem!");
    }

    const formData = new FormData();
    formData.append("nome", document.getElementById("prod-nome").value);
    formData.append("preco", document.getElementById("prod-preco").value);
    formData.append(
      "categoria",
      document.getElementById("prod-categoria").value,
    );
    formData.append("imagem", file);

    try {
      await fetch("/api/produtos", {
        method: "POST",
        body: formData, // 👈 IMPORTANTE
      });

      alert("Produto cadastrado com imagem!");
      form.reset();
    } catch (err) {
      alert("Erro ao cadastrar produto");
    }
  });
}
