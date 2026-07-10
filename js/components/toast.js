class AppToast extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div id="toast-box"></div>`;
        this.box = this.querySelector("#toast-box");
    }

    show(mensaje, tipo = "success") {
        const toast = document.createElement("div");

        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensaje;
        this.box.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    }
}

customElements.define("app-toast", AppToast);

export function showToast(mensaje, tipo) {
    document.querySelector("app-toast").show(mensaje, tipo);
}
