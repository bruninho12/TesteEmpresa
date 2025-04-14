import {
  funcionariosView,
  ticketsView,
  relatoriosView,
  historicoFuncionariosView,
  setupNavigation,
} from "./modules/views.js";
import {
  setupFuncionariosHandlers,
  setupTicketsHandlers,
  setupRelatoriosHandlers,
  setupHistoricoFuncionariosHandlers,
} from "./modules/handlers.js";
import { showAlert } from "./modules/utils.js";
import * as api from "./modules/api.js";

const APP_CONFIG = {
  contentId: "app-content",
  views: {
    funcionarios: {
      template: funcionariosView,
      handler: setupFuncionariosHandlers,
      loader: api.getFuncionarios,
    },
    tickets: {
      template: ticketsView,
      handler: setupTicketsHandlers,
      loader: api.getTickets,
    },
    relatorios: {
      template: relatoriosView,
      handler: setupRelatoriosHandlers,
    },
    historicoFuncionarios: {
      template: historicoFuncionariosView,
      handler: setupHistoricoFuncionariosHandlers,
      loader: api.getFuncionariosHistorico,
    },
  },
};

class AppController {
  constructor() {
    this.initNavigation();
    setupNavigation(this);
    this.loadView("funcionarios");
  }

  initNavigation() {
    Object.keys(APP_CONFIG.views).forEach((view) => {
      const navItem = document.getElementById(`nav-${view}`);
      if (navItem) {
        navItem.addEventListener("click", () => this.loadView(view));
      }
    });
  }

  async loadView(viewName) {
    try {
      const viewConfig = APP_CONFIG.views[viewName];
      if (!viewConfig) return;

      const container = document.getElementById(APP_CONFIG.contentId);
      container.innerHTML = viewConfig.template;

      const data = viewConfig.loader ? await viewConfig.loader() : null;
      await viewConfig.handler(data);

      this.setActiveNav(viewName);
    } catch (error) {
      showAlert(`Falha ao carregar ${viewName}: ${error.message}`, "danger");
    }
  }

  setActiveNav(activeView) {
    Object.keys(APP_CONFIG.views).forEach((view) => {
      const navItem = document.getElementById(`nav-${view}`);
      if (navItem) {
        navItem.classList.toggle("active", view === activeView);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new AppController());
