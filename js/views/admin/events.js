import { getCategories, getEvents, createEvent, updateEvent, deleteEvent } from "../../handlers/adminHandlers.js";
import { openModal, closeModal } from "../../components/modal.js";
import { showToast } from "../../components/toast.js";
import "../../components/creationMenu.js";

const CIUDADES = ["Barranquilla", "Bogotá", "Bucaramanga", "Medellín"];

class EventsView extends HTMLElement {
    connectedCallback() {
        this.busqueda = "";
        this.render();
        this.addEventListener("open-create", () => this.abrirFormulario());
    }

    render() {
        const categorias = getCategories();
        const eventos = getEvents().filter((evento) =>
            evento.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
        );

        this.innerHTML = `
        <article id="create-overview">
            <h2>Administración de eventos</h2>
            <creation-menu label="+ Crear evento"></creation-menu>
            <p>Vista general de todos los eventos existentes y por existir.</p>
        </article>

        <div id="management-container">
            <div id="filter-container">
                <input id="event-search" placeholder="Buscar eventos..." value="${this.busqueda}">
                <div id="management-buttons">
                    <button type="button">Todos los eventos</button>
                </div>
            </div>

            <div id="management-list">
                <ul>
                    <li class="list-header">
                        <span>Código</span>
                        <span>Nombre</span>
                        <span>Categoría</span>
                        <span>Ciudad</span>
                        <span>Fecha</span>
                        <span>Precio</span>
                        <span>Acciones</span>
                    </li>
                    ${eventos.length ? eventos.map((evento) => this.filaEvento(evento, categorias)).join("") : `<li class="empty-state">No se encontraron eventos.</li>`}
                </ul>
            </div>
        </div>

        <div id="performance-container">
            <div class="performance-stats">
                <p class="icon">🎫</p>
                <div class="performance-text">
                    <p>TOTAL EVENTOS</p>
                    <p>${getEvents().length}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">🏙️</p>
                <div class="performance-text">
                    <p>CIUDADES ACTIVAS</p>
                    <p>${new Set(getEvents().map((evento) => evento.ciudad)).size}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">🏷️</p>
                <div class="performance-text">
                    <p>CATEGORÍAS</p>
                    <p>${categorias.length}</p>
                </div>
            </div>
        </div>`;

        this.initializeEvents();
    }

    filaEvento(evento, categorias) {
        const categoria = categorias.find((item) => item.id === evento.categoriaId);

        return `
        <li data-id="${evento.id}">
            <span data-label="Código">${evento.codigo}</span>
            <span data-label="Nombre">${evento.nombre}</span>
            <span data-label="Categoría">${categoria ? categoria.nombre : "Sin categoría"}</span>
            <span data-label="Ciudad">${evento.ciudad}</span>
            <span data-label="Fecha">${evento.fecha} ${evento.hora}</span>
            <span data-label="Precio">${this.formatoMoneda(evento.precio)}</span>
            <span data-label="Acciones" class="list-actions">
                <button class="edit-btn" type="button">Editar</button>
                <button class="delete-btn" type="button">Eliminar</button>
            </span>
        </li>`;
    }

    initializeEvents() {
        this.querySelector("#event-search").addEventListener("input", (event) => {
            this.busqueda = event.target.value;
            this.render();

            const buscador = this.querySelector("#event-search");
            buscador.focus();
            buscador.setSelectionRange(buscador.value.length, buscador.value.length);
        });

        this.querySelectorAll(".edit-btn").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("li").dataset.id);
                const evento = getEvents().find((item) => item.id === id);
                this.abrirFormulario(evento);
            });
        });

        this.querySelectorAll(".delete-btn").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("li").dataset.id);
                this.eliminarEvento(id);
            });
        });
    }

    abrirFormulario(evento = null) {
        const esEdicion = Boolean(evento);
        const categorias = getCategories();

        if (categorias.length === 0) {
            showToast("Primero debes crear una categoría", "error");
            return;
        }

        openModal(`
        <form id="event-form">
            <h3>${esEdicion ? "Editar evento" : "Crear evento"}</h3>
            <label>
                Código
                <input type="text" id="event-code" required value="${esEdicion ? evento.codigo : ""}">
            </label>
            <label>
                Nombre
                <input type="text" id="event-name" required value="${esEdicion ? evento.nombre : ""}">
            </label>
            <label>
                Categoría
                <select id="event-category" required>
                    ${categorias.map((categoria) => `<option value="${categoria.id}" ${esEdicion && evento.categoriaId === categoria.id ? "selected" : ""}>${categoria.nombre}</option>`).join("")}
                </select>
            </label>
            <label>
                Precio
                <input type="number" id="event-price" min="0" required value="${esEdicion ? evento.precio : ""}">
            </label>
            <label>
                Fecha
                <input type="date" id="event-date" required value="${esEdicion ? evento.fecha : ""}">
            </label>
            <label>
                Hora
                <input type="time" id="event-time" required value="${esEdicion ? evento.hora : ""}">
            </label>
            <label>
                Ciudad
                <select id="event-city" required>
                    ${CIUDADES.map((ciudad) => `<option value="${ciudad}" ${esEdicion && evento.ciudad === ciudad ? "selected" : ""}>${ciudad}</option>`).join("")}
                </select>
            </label>
            <label>
                Imagen (URL)
                <input type="url" id="event-image" required value="${esEdicion ? evento.imagen : ""}">
            </label>
            <label>
                Descripción
                <textarea id="event-description" required>${esEdicion ? evento.descripcion : ""}</textarea>
            </label>
            <button type="submit">${esEdicion ? "Guardar cambios" : "Crear evento"}</button>
        </form>`);

        document.querySelector("#event-form").addEventListener("submit", (event) => {
            event.preventDefault();

            const datos = {
                codigo: document.querySelector("#event-code").value.trim(),
                nombre: document.querySelector("#event-name").value.trim(),
                categoriaId: Number(document.querySelector("#event-category").value),
                precio: Number(document.querySelector("#event-price").value),
                fecha: document.querySelector("#event-date").value,
                hora: document.querySelector("#event-time").value,
                ciudad: document.querySelector("#event-city").value,
                imagen: document.querySelector("#event-image").value.trim(),
                descripcion: document.querySelector("#event-description").value.trim()
            };

            if (esEdicion) {
                updateEvent(evento.id, datos);
                showToast("Evento actualizado correctamente", "success");
            } else {
                createEvent(datos);
                showToast("Evento creado correctamente", "success");
            }

            closeModal();
            this.render();
        });
    }

    eliminarEvento(id) {
        if (window.confirm("¿Deseas eliminar este evento?")) {
            deleteEvent(id);
            showToast("Evento eliminado correctamente", "success");
            this.render();
        }
    }

    formatoMoneda(valor) {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
    }
}

customElements.define("events-view", EventsView);
