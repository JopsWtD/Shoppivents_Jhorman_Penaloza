import { login } from "../auth.js";
import { showToast } from "./toast.js";

class LoginModal extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="login-container">
            <aside id="login-brand">
                <div id="login-brand-top">
                    <span id="login-brand-tag">● ADMIN SYSTEM V2.4</span>
                </div>
                <div id="login-brand-bottom">
                    <h2>Gestión de Alta Fidelidad.</h2>
                    <p>Accede al panel administrativo de Shoppivents para gestionar categorías, eventos y ventas en tiempo real.</p>
                </div>
            </aside>

            <div id="login-panel">
                <a id="login-back" href="#/">← Volver al sitio</a>
                <form id="login-form">
                    <h2>Shoppivents</h2>
                    <p>Bienvenido de nuevo. Por favor, ingresa tus credenciales.</p>

                    <label>
                        Correo electrónico
                        <div class="login-field">
                            <span class="login-field-icon">✉</span>
                            <input type="email" id="login-email" required placeholder="admin@mail.com">
                        </div>
                    </label>

                    <label>
                        Contraseña
                        <div class="login-field">
                            <span class="login-field-icon">🔒</span>
                            <input type="password" id="login-password" required placeholder="••••••••">
                            <button type="button" id="login-toggle" aria-label="Mostrar contraseña">👁</button>
                        </div>
                    </label>

                    <button type="submit">Ingresar →</button>

                    <p id="login-hint">Usa <strong>admin@mail.com</strong> / <strong>123456</strong></p>
                </form>

                <p id="login-footer">© 2026 HIGH-FIDELITY TICKETING</p>
            </div>
        </section>`;

        this.initializeEvents();
    }

    initializeEvents() {
        const form = this.querySelector("#login-form");
        const passwordInput = this.querySelector("#login-password");
        const toggle = this.querySelector("#login-toggle");

        toggle.addEventListener("click", () => {
            const visible = passwordInput.type === "text";
            passwordInput.type = visible ? "password" : "text";
            toggle.classList.toggle("active", !visible);
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = this.querySelector("#login-email").value.trim();
            const password = passwordInput.value.trim();

            if (login(email, password)) {
                showToast("Inicio de sesión exitoso", "success");
                window.location.hash = "#dashboard";
            } else {
                showToast("Correo o contraseña incorrectos", "error");
            }
        });
    }
}

customElements.define("login-modal", LoginModal);
