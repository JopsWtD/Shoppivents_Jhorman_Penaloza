import { getCategories } from "../../handlers/adminHandlers.js";
import { getEventosConCategoria } from "../../handlers/customerHandlers.js";
import "../../components/eventCard.js";

const CIUDADES = ["Barranquilla", "Bogotá", "Bucaramanga", "Medellín"];

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor || 0);
}

function formatoFecha(fecha) {
    if (!fecha) return "";
    const d = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export function renderHome() {
    const root = document.createElement("div");
    root.className = "view-home";

    const categorias = getCategories();
    const eventos = getEventosConCategoria();

    const proximos = [...eventos]
        .filter((evento) => evento.fecha)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const destacados = proximos.slice(0, 4);

    root.innerHTML = `
    <section class="hero">
        <div class="hero-copy">
            <h1>Vive los mejores eventos del país</h1>
            <p>Conecta con conciertos, deportes y experiencias inolvidables. La plataforma de ticketing pensada para la velocidad y la emoción.</p>
            <div class="hero-actions">
                <button class="btn-primary" data-action="explorar">Explorar eventos</button>
                <button class="btn-outline" data-action="destacados">Ver destacados</button>
            </div>
        </div>
    </section>

    <section class="search-section">
        <form id="home-search">
            <div class="search-field">
                <span>🔍</span>
                <input type="text" name="texto" placeholder="Buscar artista o evento" autocomplete="off">
            </div>
            <div class="search-field">
                <span>🏷️</span>
                <select name="categoria">
                    <option value="">Categoría</option>
                    ${categorias.map((categoria) => `<option value="${categoria.id}">${categoria.nombre}</option>`).join("")}
                </select>
            </div>
            <div class="search-field">
                <span>📍</span>
                <select name="ciudad">
                    <option value="">Ciudad</option>
                    ${CIUDADES.map((ciudad) => `<option value="${ciudad}">${ciudad}</option>`).join("")}
                </select>
            </div>
            <button class="btn-primary" type="submit">Buscar</button>
        </form>
    </section>

    <section class="section" id="destacados">
        <div class="section-heading">
            <div>
                <h2>Eventos destacados</h2>
                <p>Las mejores experiencias elegidas para ti.</p>
            </div>
            <a href="#/eventos" class="section-link">Ver todos →</a>
        </div>
        <div class="events-grid" id="featured-grid"></div>
    </section>

    <section class="section">
        <h2 class="section-title">Categorías populares</h2>
        <div class="categories-bento" id="categories-bento"></div>
    </section>

    <section class="section">
        <div class="section-heading">
            <h2>Próximos eventos</h2>
        </div>
        <div class="upcoming-list" id="upcoming-list"></div>
    </section>`;

    const featuredGrid = root.querySelector("#featured-grid");

    if (destacados.length === 0) {
        featuredGrid.innerHTML = estadoVacio("🎫", "Todavía no hay eventos publicados", "Muy pronto encontrarás aquí los mejores conciertos.");
    } else {
        destacados.forEach((evento) => {
            const card = document.createElement("event-card");
            card.data = evento;
            featuredGrid.appendChild(card);
        });
    }

    const bento = root.querySelector("#categories-bento");

    if (categorias.length === 0) {
        bento.innerHTML = estadoVacio("🗂️", "Aún no hay categorías", "Vuelve pronto para explorar por tipo de evento.");
    } else {
        bento.innerHTML = categorias.slice(0, 4).map((categoria) => {
            const cantidad = eventos.filter((evento) => evento.categoriaId === categoria.id).length;
            return `
            <a href="#/eventos?categoria=${categoria.id}" class="category-tile">
                <h3>${categoria.nombre}</h3>
                <p>${cantidad} evento${cantidad === 1 ? "" : "s"} disponible${cantidad === 1 ? "" : "s"}</p>
            </a>`;
        }).join("");
    }

    const upcoming = root.querySelector("#upcoming-list");

    if (proximos.length === 0) {
        upcoming.innerHTML = estadoVacio("📅", "No hay próximos eventos", "Cuando se publiquen eventos, aparecerán aquí.");
    } else {
        upcoming.innerHTML = proximos.slice(0, 6).map((evento) => `
        <div class="upcoming-item" data-id="${evento.id}">
            <div class="upcoming-thumb">
                <img src="${evento.imagen || ""}" alt="${evento.nombre}">
            </div>
            <div class="upcoming-info">
                <p class="upcoming-date">${formatoFecha(evento.fecha)}</p>
                <h4>${evento.nombre}</h4>
                <p class="upcoming-city">${evento.ciudad || ""}</p>
            </div>
            <div class="upcoming-price">
                <p>${formatoMoneda(evento.precio)}</p>
                <span>›</span>
            </div>
        </div>`).join("");

        upcoming.querySelectorAll("[data-id]").forEach((elemento) => {
            elemento.addEventListener("click", () => {
                window.location.hash = `#/evento/${elemento.dataset.id}`;
            });
        });
    }

    root.querySelector("[data-action=explorar]").addEventListener("click", () => {
        window.location.hash = "#/eventos";
    });

    root.querySelector("[data-action=destacados]").addEventListener("click", () => {
        root.querySelector("#destacados").scrollIntoView({ behavior: "smooth" });
    });

    root.querySelector("#home-search").addEventListener("submit", (event) => {
        event.preventDefault();
        const datos = new FormData(event.target);
        const params = new URLSearchParams();

        if (datos.get("texto")) params.set("q", datos.get("texto"));
        if (datos.get("categoria")) params.set("categoria", datos.get("categoria"));
        if (datos.get("ciudad")) params.set("ciudad", datos.get("ciudad"));

        window.location.hash = `#/eventos?${params.toString()}`;
    });

    return root;
}

function estadoVacio(icono, titulo, texto) {
    return `
    <div class="empty-state">
        <p class="empty-icon">${icono}</p>
        <h3>${titulo}</h3>
        <p>${texto}</p>
    </div>`;
}
