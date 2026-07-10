import { getCategories } from "../../handlers/adminHandlers.js";
import { buscarEventos } from "../../handlers/customerHandlers.js";
import "../../components/eventCard.js";

const CIUDADES = ["Barranquilla", "Bogotá", "Bucaramanga", "Medellín"];

export function renderEvents(query) {
    const root = document.createElement("div");
    root.className = "view-events";

    const categorias = getCategories();
    const inicial = {
        texto: query.get("q") || "",
        categoria: query.get("categoria") || "",
        ciudad: query.get("ciudad") || ""
    };

    root.innerHTML = `
    <section class="section">
        <h1 class="events-title">Todos los eventos</h1>
        <p class="events-subtitle">Encuentra el evento perfecto para ti.</p>

        <div class="filters-bar">
            <div class="filters-search">
                <span>🔍</span>
                <input type="text" id="filter-text" placeholder="Buscar por nombre del evento" value="${inicial.texto}" autocomplete="off">
            </div>
            <select id="filter-category">
                <option value="">Todas las categorías</option>
                ${categorias.map((categoria) => `<option value="${categoria.id}" ${String(categoria.id) === inicial.categoria ? "selected" : ""}>${categoria.nombre}</option>`).join("")}
            </select>
            <select id="filter-city">
                <option value="">Todas las ciudades</option>
                ${CIUDADES.map((ciudad) => `<option value="${ciudad}" ${ciudad === inicial.ciudad ? "selected" : ""}>${ciudad}</option>`).join("")}
            </select>
            <button class="btn-ghost" type="button" id="filter-clear">Limpiar</button>
        </div>

        <p class="filters-count" id="filter-count"></p>

        <div class="events-grid" id="events-grid"></div>
    </section>`;

    const grid = root.querySelector("#events-grid");
    const conteo = root.querySelector("#filter-count");
    const inputTexto = root.querySelector("#filter-text");
    const selectCategoria = root.querySelector("#filter-category");
    const selectCiudad = root.querySelector("#filter-city");

    const categoriasMap = new Map(categorias.map((categoria) => [categoria.id, categoria.nombre]));
    let temporizador = null;

    function filtrosActuales() {
        return {
            texto: inputTexto.value,
            categoriaId: selectCategoria.value,
            ciudad: selectCiudad.value
        };
    }

    function renderResultados() {
        const resultados = buscarEventos(filtrosActuales()).map((evento) => ({
            ...evento,
            categoriaNombre: categoriasMap.get(evento.categoriaId) || "Evento"
        }));

        conteo.textContent = resultados.length === 0
            ? ""
            : `${resultados.length} evento${resultados.length === 1 ? "" : "s"} encontrado${resultados.length === 1 ? "" : "s"}`;

        if (resultados.length === 0) {
            grid.innerHTML = `
            <div class="empty-state">
                <p class="empty-icon">🔎</p>
                <h3>No encontramos eventos con esos filtros</h3>
                <p>Intenta con otra palabra clave o quita algún filtro.</p>
                <button class="btn-dark" id="clear-inline" type="button">Limpiar filtros</button>
            </div>`;

            grid.querySelector("#clear-inline").addEventListener("click", limpiarFiltros);
            return;
        }

        grid.innerHTML = "";
        resultados.forEach((evento) => {
            const card = document.createElement("event-card");
            card.data = evento;
            grid.appendChild(card);
        });
    }

    function sincronizarUrl() {
        const filtros = filtrosActuales();
        const params = new URLSearchParams();

        if (filtros.texto) params.set("q", filtros.texto);
        if (filtros.categoriaId) params.set("categoria", filtros.categoriaId);
        if (filtros.ciudad) params.set("ciudad", filtros.ciudad);

        const qs = params.toString();
        history.replaceState(null, "", `#/eventos${qs ? `?${qs}` : ""}`);
    }

    function limpiarFiltros() {
        inputTexto.value = "";
        selectCategoria.value = "";
        selectCiudad.value = "";
        sincronizarUrl();
        renderResultados();
    }

    inputTexto.addEventListener("input", () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
            sincronizarUrl();
            renderResultados();
        }, 200);
    });

    selectCategoria.addEventListener("change", () => {
        sincronizarUrl();
        renderResultados();
    });

    selectCiudad.addEventListener("change", () => {
        sincronizarUrl();
        renderResultados();
    });

    root.querySelector("#filter-clear").addEventListener("click", limpiarFiltros);

    renderResultados();

    return root;
}
