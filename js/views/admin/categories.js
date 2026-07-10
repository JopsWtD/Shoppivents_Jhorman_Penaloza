import { getCategories, createCategory, updateCategory, deleteCategory, getEvents } from "../../handlers/adminHandlers.js";
import { openModal, closeModal } from "../../components/modal.js";
import { showToast } from "../../components/toast.js";
import "../../components/creationMenu.js";

class CategoriesView extends HTMLElement {
    connectedCallback() {
        this.busqueda = "";
        this.render();
        this.addEventListener("open-create", () => this.abrirFormulario());
    }

    render() {
        const eventos = getEvents();
        const categorias = getCategories().filter((categoria) =>
            categoria.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
        );
        const stats = this.calcularEstadisticas(getCategories(), eventos);

        this.innerHTML = `
        <article id="create-overview">
            <h2>Administración de categorías</h2>
            <creation-menu label="+ Crear categoría"></creation-menu>
            <p>Vista general de todas las categorías disponibles.</p>
        </article>

        <div id="management-container">
            <div id="filter-container">
                <input id="category-search" placeholder="Buscar categorías..." value="${this.busqueda}">
                <div id="management-buttons">
                    <button type="button">Todas las categorías</button>
                </div>
            </div>

            <div id="management-list">
                <ul>
                    <li class="list-header">
                        <span>Nombre</span>
                        <span>Descripción</span>
                        <span>Eventos</span>
                        <span>Acciones</span>
                    </li>
                    ${categorias.length ? categorias.map((categoria) => this.filaCategoria(categoria, eventos)).join("") : `<li class="empty-state">No se encontraron categorías.</li>`}
                </ul>
            </div>
        </div>

        <div id="performance-container">
            <div class="performance-stats">
                <p class="icon">🏷️</p>
                <div class="performance-text">
                    <p>TOTAL CATEGORÍAS</p>
                    <p>${stats.total}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">🔥</p>
                <div class="performance-text">
                    <p>CATEGORÍA MÁS USADA</p>
                    <p>${stats.masUsada}</p>
                </div>
            </div>
            <div class="performance-stats">
                <p class="icon">🎫</p>
                <div class="performance-text">
                    <p>EVENTOS ASOCIADOS</p>
                    <p>${stats.eventosAsociados}</p>
                </div>
            </div>
        </div>`;

        this.initializeEvents();
    }

    filaCategoria(categoria, eventos) {
        const cantidadEventos = eventos.filter((evento) => evento.categoriaId === categoria.id).length;

        return `
        <li data-id="${categoria.id}">
            <span data-label="Nombre">${categoria.nombre}</span>
            <span data-label="Descripción">${categoria.descripcion}</span>
            <span data-label="Eventos">${cantidadEventos}</span>
            <span data-label="Acciones" class="list-actions">
                <button class="edit-btn" type="button">Editar</button>
                <button class="delete-btn" type="button">Eliminar</button>
            </span>
        </li>`;
    }

    initializeEvents() {
        this.querySelector("#category-search").addEventListener("input", (event) => {
            this.busqueda = event.target.value;
            this.render();

            const buscador = this.querySelector("#category-search");
            buscador.focus();
            buscador.setSelectionRange(buscador.value.length, buscador.value.length);
        });

        this.querySelectorAll(".edit-btn").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("li").dataset.id);
                const categoria = getCategories().find((item) => item.id === id);
                this.abrirFormulario(categoria);
            });
        });

        this.querySelectorAll(".delete-btn").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("li").dataset.id);
                this.eliminarCategoria(id);
            });
        });
    }

    abrirFormulario(categoria = null) {
        const esEdicion = Boolean(categoria);

        openModal(`
        <form id="category-form">
            <h3>${esEdicion ? "Editar categoría" : "Crear categoría"}</h3>
            <label>
                Nombre
                <input type="text" id="category-name" required value="${esEdicion ? categoria.nombre : ""}">
            </label>
            <label>
                Descripción
                <textarea id="category-description" required>${esEdicion ? categoria.descripcion : ""}</textarea>
            </label>
            <button type="submit">${esEdicion ? "Guardar cambios" : "Crear categoría"}</button>
        </form>`);

        document.querySelector("#category-form").addEventListener("submit", (event) => {
            event.preventDefault();

            const nombre = document.querySelector("#category-name").value.trim();
            const descripcion = document.querySelector("#category-description").value.trim();

            if (esEdicion) {
                updateCategory(categoria.id, { nombre, descripcion });
                showToast("Categoría actualizada correctamente", "success");
            } else {
                createCategory({ nombre, descripcion });
                showToast("Categoría creada correctamente", "success");
            }

            closeModal();
            this.render();
        });
    }

    eliminarCategoria(id) {
        const eventosAsociados = getEvents().filter((evento) => evento.categoriaId === id).length;

        if (eventosAsociados > 0) {
            showToast("No puedes eliminar una categoría con eventos asociados", "error");
            return;
        }

        if (window.confirm("¿Deseas eliminar esta categoría?")) {
            deleteCategory(id);
            showToast("Categoría eliminada correctamente", "success");
            this.render();
        }
    }

    calcularEstadisticas(categorias, eventos) {
        const conteos = categorias.map((categoria) => ({
            nombre: categoria.nombre,
            cantidad: eventos.filter((evento) => evento.categoriaId === categoria.id).length
        }));

        const masUsada = [...conteos].sort((a, b) => b.cantidad - a.cantidad)[0];

        return {
            total: categorias.length,
            masUsada: masUsada && masUsada.cantidad > 0 ? masUsada.nombre : "Sin datos",
            eventosAsociados: eventos.length
        };
    }
}

customElements.define("categories-view", CategoriesView);
