import { getSales } from "../../handlers/adminHandlers.js";
import { openModal, closeModal } from "../../components/modal.js";

class SalesView extends HTMLElement {
    connectedCallback() {
        this.busqueda = "";
        this.render();
    }

    render() {
        const ventas = getSales().filter((venta) =>
            venta.cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
            venta.ciudad.toLowerCase().includes(this.busqueda.toLowerCase())
        );

        const totalIngresos = getSales().reduce((total, venta) => total + venta.total, 0);
        const totalTickets = getSales().reduce((total, venta) => total + venta.items.reduce((sum, item) => sum + (item.cantidad || 1), 0), 0);

        this.innerHTML = `
        <article id="create-overview">
            <h2>Administración de ventas</h2>
            <p>Vista general de todas las ventas realizadas.</p>
        </article>

        <div id="management-container">
            <div id="filter-container">
                <input id="sale-search" placeholder="Buscar por cliente o ciudad..." value="${this.busqueda}">
                <div id="management-buttons">
                    <button type="button">Todas las ventas</button>
                </div>
            </div>

            <div id="management-list">
                <ul>
                    <li class="list-header">
                        <span>Cliente</span>
                        <span>Ciudad</span>
                        <span>Fecha</span>
                        <span>Total</span>
                        <span>Acciones</span>
                    </li>
                    ${ventas.length ? ventas.map((venta) => this.filaVenta(venta)).join("") : `<li class="empty-state">No se encontraron ventas.</li>`}
                </ul>
            </div>
        </div>

        <div id="performance-container">
            <div class="performance-stats">
                <p class="icon">🧾</p>
                <div class="performance-text">
                    <p>TOTAL VENTAS</p>
                    <p>${getSales().length}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">💰</p>
                <div class="performance-text">
                    <p>INGRESOS TOTALES</p>
                    <p>${this.formatoMoneda(totalIngresos)}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">🎟️</p>
                <div class="performance-text">
                    <p>TICKETS VENDIDOS</p>
                    <p>${totalTickets}</p>
                </div>
            </div>
        </div>`;

        this.initializeEvents();
    }

    filaVenta(venta) {
        return `
        <li data-id="${venta.id}">
            <span data-label="Cliente">${venta.cliente.nombre}</span>
            <span data-label="Ciudad">${venta.ciudad}</span>
            <span data-label="Fecha">${this.formatoFecha(venta.fecha)}</span>
            <span data-label="Total">${this.formatoMoneda(venta.total)}</span>
            <span data-label="Acciones" class="list-actions">
                <button class="detail-btn" type="button">Ver detalle</button>
            </span>
        </li>`;
    }

    initializeEvents() {
        this.querySelector("#sale-search").addEventListener("input", (event) => {
            this.busqueda = event.target.value;
            this.render();

            const buscador = this.querySelector("#sale-search");
            buscador.focus();
            buscador.setSelectionRange(buscador.value.length, buscador.value.length);
        });



        this.querySelectorAll(".detail-btn").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("li").dataset.id);
                const venta = getSales().find((item) => item.id === id);
                this.mostrarDetalle(venta);
            });
        
        });
    }

    mostrarDetalle(venta) {
        openModal(`
        <div id="sale-detail">
            <h3>Detalle de la venta</h3>
            <p><strong>Cliente:</strong> ${venta.cliente.nombre}</p>
            <p><strong>Identificación:</strong> ${venta.cliente.identificacion}</p>
            <p><strong>Dirección:</strong> ${venta.cliente.direccion}</p>
            <p><strong>Teléfono:</strong> ${venta.cliente.telefono}</p>
            <p><strong>Email:</strong> ${venta.cliente.email}</p>
            <p><strong>Ciudad:</strong> ${venta.ciudad}</p>
            <p><strong>Fecha:</strong> ${this.formatoFecha(venta.fecha)}</p>
            <ul id="sale-detail-items">
                ${venta.items.map((item) => `<li><span>${item.nombre}</span><span>${this.formatoMoneda(item.precio)}</span></li>`).join("")}
            </ul>
            <p id="sale-detail-total"><strong>Total:</strong> ${this.formatoMoneda(venta.total)}</p>
            <button id="close-detail-btn" type="button">Cerrar</button>
        </div>`);

        document.querySelector("#close-detail-btn").addEventListener("click", () => closeModal());
    }

    formatoFecha(fecha) {
        return new Date(fecha).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
    }

    formatoMoneda(valor) {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
    }
}

customElements.define("sales-view", SalesView);
