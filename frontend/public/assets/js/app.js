// Controlador principal do Totem de Autoatendimento
import {
  totemView,
  carrinhoView,
  cozinhaView,
  cadastroView,
} from "./modules/views.js";

import {
  setupTotemHandlers,
  setupCarrinhoHandlers,
  setupCozinhaHandlers,
  setupCadastroHandlers,
} from "./modules/handlers.js";

import { showAlert } from "./modules/utils.js";
import * as api from "./modules/api.js";

// Configuração das rotas e telas
const APP_CONFIG = {
  contentId: "app-content",
  views: {
    totem: {
      template: totemView,
      handler: setupTotemHandlers,
      loader: api.getProdutos,
    },
    carrinho: {
      template: carrinhoView,
      handler: setupCarrinhoHandlers,
      loader: null,
    },
    cozinha: {
      template: cozinhaView,
      handler: setupCozinhaHandlers,
      loader: api.getPedidos,
    },
    cadastro: {
      template: cadastroView,
      handler: setupCadastroHandlers,
      loader: null,
    },
  },
};

class AppController {
  constructor() {
    this.contentContainer = document.getElementById(APP_CONFIG.contentId);

    // deixa global para onclick funcionar
    window.appInstance = this;

    this.init();
  }

  async init() {
    this.bindNavEvents(); 
    await this.loadView("totem");
  }

  /**
   * NAVEGAÇÃO FUNCIONANDO
   */
  bindNavEvents() {
    document.getElementById("nav-totem")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.loadView("totem");
    });

    document.getElementById("nav-cozinha")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.loadView("cozinha");
    });

    document.getElementById("nav-cadastro")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.loadView("cadastro");
    });

    document.getElementById("nav-carrinho")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.loadView("carrinho");
    });
  }

  /**
   * TROCA DE TELA
   */
  async loadView(viewName) {
    try {
      const viewConfig = APP_CONFIG.views[viewName];
      if (!viewConfig) throw new Error(`Tela "${viewName}" não encontrada.`);

      // loading
      this.contentContainer.innerHTML = `
        <div class="text-center mt-5">
          <div class="spinner-border text-warning"></div>
          <p class="mt-2">Carregando...</p>
        </div>
      `;

      // busca dados
      const data = viewConfig.loader ? await viewConfig.loader() : null;

      // renderiza tela
      this.contentContainer.innerHTML = viewConfig.template;

      // ativa handlers
      await viewConfig.handler(data);

      // ativa menu correto
      this.setActiveNav(viewName);

      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      showAlert(`Erro ao abrir ${viewName}`, "danger");
    }
  }

  /**
   * ATIVA MENU
   */
  setActiveNav(activeView) {
    document.querySelectorAll("header .nav-link").forEach((navItem) => {
      navItem.classList.remove("active");

      if (navItem.id === `nav-${activeView}`) {
        navItem.classList.add("active");
      }
    });
  }
}

// inicialização
document.addEventListener("DOMContentLoaded", () => {
  new AppController();
});
