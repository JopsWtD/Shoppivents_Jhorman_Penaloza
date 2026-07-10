import "./components/modal.js";
import "./components/toast.js";
import "./components/creationMenu.js";
import "./components/loginModal.js";
import "./components/navbar.js";
import "./components/cartModal.js";
import "./views/layouts/adminLayout.js";
import "./views/admin/dashboard.js";
import "./views/admin/categories.js";
import "./views/admin/events.js";
import "./views/admin/sales.js";
import "./views/admin/salesReport.js";
import { renderHome } from "./views/customer/home.js";
import { renderEvents } from "./views/customer/events.js";
import { renderEventDetail } from "./views/customer/eventDetail.js";
import { isAuthenticated } from "./auth.js";

const adminRoutes = {
  "#dashboard": "dashboard-view",
  "#categories": "categories-view",
  "#events": "events-view",
  "#sales": "sales-view",
  "#sales-report": "sales-report-view"
};

function parseHash() {
  const raw = window.location.hash.slice(1) || "/";
  const [path, queryString = ""] = raw.split("?");
  return { path, query: new URLSearchParams(queryString) };
}

function esRutaAdmin(hash) {
  return hash === "#login" || Object.keys(adminRoutes).includes(hash);
}

export function loadRoute() {
  const app = document.querySelector("#app");
  const hash = window.location.hash || "#/";

  if (esRutaAdmin(hash)) {
    toggleShell(false);
    loadAdminRoute(app, hash);
    return;
  }

  toggleShell(true);
  loadCustomerRoute(app);
}

function loadAdminRoute(app, hash) {
  if (hash === "#login") {
    if (isAuthenticated()) {
      window.location.hash = "#dashboard";
      return;
    }

    app.innerHTML = "<login-modal></login-modal>";
    return;
  }

  if (!isAuthenticated()) {
    window.location.hash = "#login";
    return;
  }

  const tag = adminRoutes[hash];

  if (!tag) {
    window.location.hash = "#dashboard";
    return;
  }

  app.innerHTML = `<admin-layout active-route="${hash.replace("#", "")}"><${tag}></${tag}></admin-layout>`;
}

function loadCustomerRoute(app) {
  const { path, query } = parseHash();
  let vista = null;

  if (path === "/" || path === "") {
    vista = renderHome();
  } else if (path === "/eventos") {
    vista = renderEvents(query);
  } else if (path.startsWith("/evento/")) {
    const id = decodeURIComponent(path.split("/")[2]);
    vista = renderEventDetail(id);
  } else {
    vista = renderNotFound();
  }

  app.innerHTML = "";
  if (vista) app.appendChild(vista);
  window.scrollTo(0, 0);
}

function renderNotFound() {
  const root = document.createElement("div");
  root.className = "view-not-found section";
  root.innerHTML = `
    <div class="empty-state">
        <p class="empty-icon">🔎</p>
        <h3>Página no encontrada</h3>
        <a href="#/" class="btn-dark">Volver al inicio</a>
    </div>`;
  return root;
}

function toggleShell(visible) {
  const header = document.querySelector("#customer-shell");
  if (header) header.hidden = !visible;
}
