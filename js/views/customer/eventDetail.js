import { getEventById, getCategoryById, agregarAlCarrito } from "../../handlers/customerHandlers.js";
import { showToast } from "../../components/toast.js";

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor || 0);
}

function formatoFecha(fecha) {
    if (!fecha) return "Fecha por confirmar";
    const d = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatoHora(hora) {
    if (!hora) return "Hora por confirmar";
    const [h, m] = hora.split(":");
    const numero = Number(h);
    const periodo = numero >= 12 ? "PM" : "AM";
    const hora12 = ((numero + 11) % 12) + 1;
    return `${hora12}:${m || "00"} ${periodo}`;
}

export function renderEventDetail(id) {
    const root = document.createElement("div");
    root.className = "view-event-detail";

    const evento = getEventById(id);

    if (!evento) {
        root.innerHTML = `
        <section class="section">
            <div class="empty-state">
                <p class="empty-icon">🎫</p>
                <h3>Evento no encontrado</h3>
                <p>Es posible que este evento ya no esté disponible.</p>
                <a href="#/eventos" class="btn-dark">Ver todos los eventos</a>
            </div>
        </section>`;
        return root;
    }

    const categoria = evento.categoriaId ? getCategoryById(evento.categoriaId) : null;

    root.innerHTML = `
    <section class="section">
        <div class="event-detail">
            <button class="event-detail-back" data-action="volver" type="button">← Volver a eventos</button>

            <div class="event-detail-grid">
                <div class="event-detail-media">
                    <img src="${evento.imagen || ""}" alt="${evento.nombre}">
                </div>
                <div class="event-detail-info">
                    ${categoria ? `<span class="event-card-chip">${categoria.nombre}</span>` : ""}
                    <h1 class="event-detail-title">${evento.nombre}</h1>

                    <div class="event-detail-meta">
                        <div class="event-detail-meta-item">📅 ${formatoFecha(evento.fecha)}</div>
                        <div class="event-detail-meta-item">🕒 ${formatoHora(evento.hora)}</div>
                        <div class="event-detail-meta-item">📍 ${evento.ciudad || "Ciudad por confirmar"}</div>
                    </div>

                    <p class="event-detail-description">${evento.descripcion || "Sin descripción disponible."}</p>

                    <div class="event-detail-buy">
                        <div>
                            <p class="event-detail-price-label">Precio</p>
                            <p class="event-detail-price">${formatoMoneda(evento.precio)}</p>
                        </div>
                        <button class="btn-primary" data-action="agregar" type="button">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        </div>
    </section>`;

    root.querySelector("[data-action=volver]").addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.hash = "#/eventos";
    });

    root.querySelector("[data-action=agregar]").addEventListener("click", () => {
        agregarAlCarrito(evento.id, 1);
        showToast(`"${evento.nombre}" agregado al carrito`, "success");
    });

    return root;
}
