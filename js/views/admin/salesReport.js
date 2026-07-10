import { getSaleYears, getSaleReportByDate } from "../../handlers/adminHandlers.js";

const MONTHS = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" }
];

class SalesReportView extends HTMLElement {
    connectedCallback() {
        const hoy = new Date();

        this.year = hoy.getFullYear();
        this.month = hoy.getMonth() + 1;

        this.render();
    }

    render() {
        const years = getSaleYears();
        const reporte = getSaleReportByDate(this.year, this.month);
        const nombreMes = MONTHS.find((mes) => mes.value === this.month).label;

        this.innerHTML = `
        <article id="create-overview">
            <h2>Reporte de ventas</h2>
            <p>Mostrando resultados de <strong>${nombreMes} ${this.year}</strong>.</p>
        </article>

        <div id="report-filters">
            <label>
                Año
                <select id="report-year">
                    ${years.map((year) => `<option value="${year}" ${year === this.year ? "selected" : ""}>${year}</option>`).join("")}
                </select>
            </label>
            <label>
                Mes
                <select id="report-month">
                    ${MONTHS.map((mes) => `<option value="${mes.value}" ${mes.value === this.month ? "selected" : ""}>${mes.label}</option>`).join("")}
                </select>
            </label>
        </div>

        <div id="management-container">
            <div id="management-list">
                <ul>
                    <li class="list-header">
                        <span>Código</span>
                        <span>Evento</span>
                        <span>Cantidad</span>
                        <span>Total</span>
                    </li>
                    ${reporte.filas.length ? reporte.filas.map((fila, indice) => this.filaReporte(fila, indice)).join("") : `<li class="empty-state">No hubo ventas en el periodo seleccionado.</li>`}
                </ul>
            </div>
        </div>

        <div id="performance-container">
            <div class="performance-stats">
                <p class="icon">🧾</p>
                <div class="performance-text">
                    <p>VENTAS DEL MES</p>
                    <p>${reporte.cantidadVentas}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">🎫</p>
                <div class="performance-text">
                    <p>EVENTOS VENDIDOS</p>
                    <p>${reporte.filas.length}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">💰</p>
                <div class="performance-text">
                    <p>TOTAL GENERAL</p>
                    <p>${this.formatoMoneda(reporte.totalGeneral)}</p>
                </div>
            </div>
        </div>`;

        this.initializeEvents();
    }

    filaReporte(fila, indice) {
        return `
        <li class="${indice === 0 ? "top-row" : ""}">
            <span data-label="Código">${fila.codigo}</span>
            <span data-label="Evento">${fila.nombre}</span>
            <span data-label="Cantidad">${fila.cantidad}</span>
            <span data-label="Total">${this.formatoMoneda(fila.total)}</span>
        </li>`;
    }

    initializeEvents() {
        this.querySelector("#report-year").addEventListener("change", (event) => {
            this.year = Number(event.target.value);
            this.render();
        });

        this.querySelector("#report-month").addEventListener("change", (event) => {
            this.month = Number(event.target.value);
            this.render();
        });
    }

    formatoMoneda(valor) {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
    }
}

customElements.define("sales-report-view", SalesReportView);
