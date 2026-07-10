import { logout } from "../auth.js";

class SidebarAdmin extends HTMLElement {
  connectedCallback() {
    const activo = this.getAttribute("active") || "dashboard";

    this.innerHTML = `
        <button id="sidebar-toggle" type="button" aria-label="Abrir menú">☰</button>
        <div id="sidebar-backdrop"></div>
        <aside id="sidebar-admin">
            <h3>Admin Panel</h3>
            <div id="button-container">
            <button data-route="dashboard" class="${activo === "dashboard" ? "active" : ""}">Dashboard</button>
            <button data-route="categories" class="${activo === "categories" ? "active" : ""}">Categorías</button>
            <button data-route="events" class="${activo === "events" ? "active" : ""}">Eventos</button>
            <button data-route="sales" class="${activo === "sales" || activo === "sales-report" ? "active" : ""}">Ventas</button>
            ${activo === "sales" || activo === "sales-report" ? `<button class="${activo === "sales-report" ? "active" : ""}" data-route="sales-report" id="btn-salesReport">Reporte de ventas</button>` : ""}
            <button id="logout-btn">Cerrar sesión</button>
        </div>
        </aside>`;

    this.initializeEvents();
  }

  initializeEvents() {
    const aside = this.querySelector("#sidebar-admin");
    const toggle = this.querySelector("#sidebar-toggle");
    const backdrop = this.querySelector("#sidebar-backdrop");
    const botones = this.querySelectorAll("[data-route]");

    botones.forEach((boton) => {
      boton.addEventListener("click", () => {
        window.location.hash = boton.dataset.route;
        aside.classList.remove("open");
        backdrop.classList.remove("visible");
      });
    });

    this.querySelector("#logout-btn").addEventListener("click", () => {
      logout();
      window.location.hash = "#/";
    });

    toggle.addEventListener("click", () => {
      aside.classList.toggle("open");
      backdrop.classList.toggle("visible");
    });

    backdrop.addEventListener("click", () => {
      aside.classList.remove("open");
      backdrop.classList.remove("visible");
    });

  }

}

customElements.define("sidebar-admin", SidebarAdmin);
