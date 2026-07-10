const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function formatoFechaBadge(fecha) {
    if (!fecha) return "";

    const d = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "";

    return `${MESES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor || 0);
}

class EventCard extends HTMLElement {
    set data(valor) {
        this.evento = valor;
        this.render();
    }

    get data() {
        return this.evento;
    }

    connectedCallback() {
        if (this.evento) this.render();
    }

    render() {
        const evento = this.evento;
        if (!evento) return;

        this.className = "event-card";
        this.innerHTML = `
        <div class="event-card-media" data-role="detalle">
            <img src="${evento.imagen || ""}" alt="${evento.nombre}" loading="lazy">
            <span class="event-card-badge">${formatoFechaBadge(evento.fecha)}</span>
        </div>
        <div class="event-card-body">
            <span class="event-card-chip">${evento.categoriaNombre || "Evento"}</span>
            <h3 class="event-card-title" data-role="detalle">${evento.nombre}</h3>
            <p class="event-card-location">📍 ${evento.ciudad || ""}</p>
            <p class="event-card-time">🕒 ${evento.hora || ""}</p>
            <div class="event-card-footer">
                <div>
                    <p class="event-card-from">Desde</p>
                    <p class="event-card-price">${formatoMoneda(evento.precio)}</p>
                </div>
                <button class="event-card-buy" data-role="agregar" type="button">Agregar</button>
            </div>
        </div>`;

        this.querySelectorAll("[data-role=detalle]").forEach((elemento) => {
            elemento.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("abrir-detalle", { detail: { id: evento.id }, bubbles: true }));
            });
        });

        this.querySelector("[data-role=agregar]").addEventListener("click", (event) => {
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent("agregar-carrito", { detail: { id: evento.id, nombre: evento.nombre }, bubbles: true }));
        });
    }
}

customElements.define("event-card", EventCard);
