import { getCategories, getEvents, getSales } from "../../handlers/adminHandlers.js";

class DashboardView extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        const categorias = getCategories();
        const eventos = getEvents();
        const ventas = getSales();

        const totalTickets = ventas.reduce((total, venta) => total + venta.items.reduce((sum, item) => sum + (item.cantidad || 1), 0), 0);
        const ganancias = ventas.reduce((total, venta) => total + venta.total, 0);
        const recientes = ventas.slice(0, 5);
        const popularidad = this.calcularPopularidad(categorias, eventos);

        this.innerHTML = `
        <article id="dashboard-overview">
            <h2>Vista general</h2>
            <p>Seguimiento del rendimiento de los eventos y de la venta de los tickets en todas las regiones.</p>
            <div id="performance-container">
                <div class="performance-stats">
                    <p class="icon">🎫</p>
                    <div class="performance-text">
                        <p>EVENTOS</p>
                        <p>${eventos.length}</p>
                    </div>
                </div>
                <div class="performance-stats">
                    <p class="icon">🎟️</p>
                    <div class="performance-text">
                        <p>TICKETS</p>
                        <p>${totalTickets}</p>
                    </div>
                </div>
                <div class="performance-stats">
                    <p class="icon">🏷️</p>
                    <div class="performance-text">
                        <p>CATEGORÍAS</p>
                        <p>${categorias.length}</p>
                    </div>
                </div>
                <div class="performance-stats">
                    <p class="icon">💰</p>
                    <div class="performance-text">
                        <p>GANANCIAS</p>
                        <p>${this.formatoMoneda(ganancias)}</p>
                    </div>
                </div>
            </div>
        </article>

        <div id="dashboard-grid-handler">
            <article id="recent-sales-container">
                <h2>Últimas ventas</h2>
                <ul id="recent-sales">
                    ${recientes.length ? recientes.map((venta) => this.filaVenta(venta)).join("") : "<li>No hay ventas registradas todavía.</li>"}
                </ul>
            </article>
            <article id="genres-popularity-container">
                <h3>Géneros populares</h3>
                <div id="genres-popularity">
                    ${popularidad.length ? popularidad.map((item) => this.barraPopularidad(item)).join("") : "<p>Sin categorías registradas.</p>"}
                </div>
            </article>
        </div>`;
    }

    filaVenta(venta) {
        return `
        <li>
            <span>${venta.cliente.nombre}</span>
            <span>${venta.ciudad}</span>
            <span>${this.formatoMoneda(venta.total)}</span>
        </li>`;
    }

    barraPopularidad(item) {
        return `
        <div>
            <div id="genres-popularity-text">
                <span>${item.nombre}</span>
                <span>${item.cantidad}</span>
            </div>
            <div class="progress-bar">
                <div class="filler-bar" style="width:${item.porcentaje}%"></div>
            </div>
        </div>`;
    }

    calcularPopularidad(categorias, eventos) {
        const conteo = categorias.map((categoria) => ({
            nombre: categoria.nombre,
            cantidad: eventos.filter((evento) => evento.categoriaId === categoria.id).length
        }));

        const maximo = Math.max(1, ...conteo.map((item) => item.cantidad));

        return conteo
            .map((item) => ({ ...item, porcentaje: Math.round((item.cantidad / maximo) * 100) }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);
    }

    formatoMoneda(valor) {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
    }
}

customElements.define("dashboard-view", DashboardView);
