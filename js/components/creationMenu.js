class CreationMenu extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute("label") || "+ Crear";

        this.innerHTML = `<button id="creation-menu-btn" type="button">${label}</button>`;

        this.querySelector("#creation-menu-btn").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("open-create", { bubbles: true }));
        });
    }
}

customElements.define("creation-menu", CreationMenu);
