import { getCarritoDetallado, getTotalCarrito, quitarDelCarrito, actualizarCantidad, crearVenta } from "../handlers/customerHandlers.js";
import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor || 0);
}

class CartModal extends HTMLElement {
    connectedCallback() {
        this.ultimaVenta = null;
    }

    open() {
        this.renderCarrito();
    }

    renderCarrito() {
        const items = getCarritoDetallado();

        if (items.length === 0) {
            openModal(`
            <div id="cart-modal">
                <h3>Tu carrito</h3>
                <div class="cart-empty">
                    <p class="cart-empty-icon">🛒</p>
                    <p>Tu carrito está vacío.</p>
                    <p>Explora los eventos disponibles y agrega tus entradas.</p>
                </div>
            </div>`);
            return;
        }

        openModal(`
        <div id="cart-modal">
            <h3>Tu carrito</h3>
            <ul id="cart-list">
                ${items.map((item) => this.filaCarrito(item)).join("")}
            </ul>
            <div id="cart-total">
                <span>Total</span>
                <strong>${formatoMoneda(getTotalCarrito())}</strong>
            </div>
            <button id="cart-checkout-btn" type="button">Comprar</button>
        </div>`);

        this.eventosCarrito(items);
    }

    filaCarrito(item) {
        return `
        <li class="cart-item" data-id="${item.eventoId}">
            <img src="${item.evento.imagen || ""}" alt="${item.evento.nombre}">
            <div class="cart-item-info">
                <p class="cart-item-name">${item.evento.nombre}</p>
                <p class="cart-item-price">${formatoMoneda(item.evento.precio)} c/u</p>
                <div class="cart-item-qty">
                    <button type="button" data-action="restar" aria-label="Restar">−</button>
                    <span>${item.cantidad}</span>
                    <button type="button" data-action="sumar" aria-label="Sumar">+</button>
                </div>
            </div>
            <div class="cart-item-right">
                <p class="cart-item-subtotal">${formatoMoneda(item.subtotal)}</p>
                <button type="button" class="cart-item-remove" data-action="quitar">Quitar</button>
            </div>
        </li>`;
    }

    eventosCarrito(items) {
        document.querySelectorAll("[data-action=sumar]").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("[data-id]").dataset.id);
                const item = items.find((elemento) => elemento.eventoId === id);
                actualizarCantidad(id, item.cantidad + 1);
                this.renderCarrito();
            });
        });

        document.querySelectorAll("[data-action=restar]").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("[data-id]").dataset.id);
                const item = items.find((elemento) => elemento.eventoId === id);
                actualizarCantidad(id, item.cantidad - 1);
                this.renderCarrito();
            });
        });

        document.querySelectorAll("[data-action=quitar]").forEach((boton) => {
            boton.addEventListener("click", (event) => {
                const id = Number(event.target.closest("[data-id]").dataset.id);
                quitarDelCarrito(id);
                showToast("Evento eliminado del carrito", "success");
                this.renderCarrito();
            });
        });

        document.querySelector("#cart-checkout-btn").addEventListener("click", () => this.renderCheckout());
    }

    renderCheckout() {
        openModal(`
        <div id="checkout-modal">
            <h3>Datos de la compra</h3>
            <p id="checkout-total">Total a pagar: <strong>${formatoMoneda(getTotalCarrito())}</strong></p>
            <form id="checkout-form">
                <label>
                    Número de identificación
                    <input type="text" name="identificacion" required>
                </label>
                <label>
                    Nombre completo
                    <input type="text" name="nombre" required>
                </label>
                <label>
                    Dirección
                    <input type="text" name="direccion" required>
                </label>
                <label>
                    Teléfono
                    <input type="tel" name="telefono" required>
                </label>
                <label>
                    Correo electrónico
                    <input type="email" name="email" required>
                </label>
                <div id="checkout-actions">
                    <button type="button" id="checkout-back">Volver</button>
                    <button type="submit">Confirmar compra</button>
                </div>
            </form>
        </div>`);

        document.querySelector("#checkout-back").addEventListener("click", () => this.renderCarrito());

        document.querySelector("#checkout-form").addEventListener("submit", (event) => {
            event.preventDefault();
            this.procesarCompra(event.target);
        });
    }

    procesarCompra(form) {
        const cliente = Object.fromEntries(new FormData(form).entries());

        if (!/^\S+@\S+\.\S+$/.test(cliente.email)) {
            showToast("Ingresa un correo válido", "error");
            return;
        }

        try {
            this.ultimaVenta = crearVenta(cliente);
            this.renderConfirmacion();
            showToast("¡Compra realizada con éxito!", "success");
            window.dispatchEvent(new CustomEvent("carrito:actualizado", { detail: { carrito: [] } }));
        } catch (error) {
            showToast(error.message || "No se pudo procesar la compra", "error");
        }
    }

    renderConfirmacion() {
        const venta = this.ultimaVenta;

        openModal(`
        <div id="confirmation-modal">
            <p class="confirmation-icon">🎟️</p>
            <h3>¡Compra realizada!</h3>
            <p>Tu boleta ha sido asignada correctamente.</p>
            <p class="confirmation-code">N.º de pedido: <strong>${venta ? venta.id : ""}</strong></p>
            <p class="confirmation-hint">Te enviamos el detalle a ${venta ? venta.cliente.email : ""}.</p>
            <button id="confirmation-close" type="button">Listo</button>
        </div>`);

        document.querySelector("#confirmation-close").addEventListener("click", () => closeModal());
    }
}

customElements.define("cart-modal", CartModal);
