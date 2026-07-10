class AppModal extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id="modal-overlay" class="hidden">
            <div id="modal-box">
                <button id="modal-close" type="button" aria-label="Cerrar">&times;</button>
                <div id="modal-content"></div>
            </div>
        </div>`;

        this.overlay = this.querySelector("#modal-overlay");
        this.content = this.querySelector("#modal-content");

        this.querySelector("#modal-close").addEventListener("click", () => this.close());

        this.overlay.addEventListener("click", (event) => {
            if (event.target === this.overlay) this.close();
        });
    }

    open(html) {
        this.content.innerHTML = html;
        this.overlay.classList.remove("hidden");
    }

    close() {
        this.overlay.classList.add("hidden");
        this.content.innerHTML = "";
    }
}

customElements.define("app-modal", AppModal);

export function openModal(html) {
    document.querySelector("app-modal").open(html);
}

export function closeModal() {
    document.querySelector("app-modal").close();
}
