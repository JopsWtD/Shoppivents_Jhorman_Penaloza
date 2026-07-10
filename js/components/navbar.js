import { getCantidadCarrito } from "../handlers/customerHandlers.js";

class CustomerNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        this.onCarritoActualizado = () => this.actualizarBadge();
        window.addEventListener("carrito:actualizado", this.onCarritoActualizado);
        window.addEventListener("hashchange", () => this.actualizarActivo());
        this.actualizarActivo();
    }

    disconnectedCallback() {
        window.removeEventListener("carrito:actualizado", this.onCarritoActualizado);
    }

    render() {
        this.innerHTML = `
        <nav id="customer-navbar">
            <div id="navbar-inner">
                <a id="navbar-brand" href="#/">Shoppivents</a>

                <button id="navbar-burger" type="button" aria-label="Abrir menú">☰</button>

                <div id="navbar-links">
                    <a href="#/" data-path="/">Inicio</a>
                    <a href="#/eventos" data-path="/eventos">Eventos</a>
                </div>

                <div id="navbar-actions">
                    <button id="navbar-cart" type="button" aria-label="Ver carrito">
                        🛒
                        <span id="navbar-cart-badge" hidden>0</span>
                    </button>
                    <a id="navbar-login" href="#login">Ingresar</a>
                </div>
            </div>
        </nav>`;

        this.querySelector("#navbar-cart").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("abrir-carrito", { bubbles: true }));
        });

        this.querySelector("#navbar-burger").addEventListener("click", () => {
            this.querySelector("#navbar-links").classList.toggle("open");
        });

        this.querySelectorAll("#navbar-links a").forEach((enlace) => {
            enlace.addEventListener("click", () => {
                this.querySelector("#navbar-links").classList.remove("open");
            });
        });

        this.actualizarBadge();
    }

    actualizarBadge() {
        const badge = this.querySelector("#navbar-cart-badge");
        if (!badge) return;

        const cantidad = getCantidadCarrito();
        badge.textContent = String(cantidad);
        badge.hidden = cantidad === 0;
    }

    actualizarActivo() {
        const actual = (window.location.hash.slice(1) || "/").split("?")[0];

        this.querySelectorAll("[data-path]").forEach((enlace) => {
            enlace.classList.toggle("active", enlace.dataset.path === actual);
        });
    }
}

customElements.define("customer-navbar", CustomerNavbar);
