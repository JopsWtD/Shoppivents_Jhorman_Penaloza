import "../../components/sidebar.js";

class AdminLayout extends HTMLElement {
    connectedCallback() {
        const activo = this.getAttribute("active-route") || "dashboard";
        const contenido = this.innerHTML;

        this.innerHTML = `
        <section class="admin-view-container">
            <sidebar-admin active="${activo}"></sidebar-admin>
            <div id="admin-view-section">
                ${contenido}
            </div>
        </section>`;
    }
}

customElements.define("admin-layout", AdminLayout);
