import { loadRoute } from "./router.js";
import { seedData } from "./data-seed.js";
import { agregarAlCarrito, getEventById } from "./handlers/customerHandlers.js";
import { showToast } from "./components/toast.js";

seedData();

function montarShell() {
  const shell = document.querySelector("#customer-shell");
  const navbar = document.createElement("customer-navbar");
  const carrito = document.createElement("cart-modal");

  shell.appendChild(navbar);
  document.querySelector("#modal-container").appendChild(carrito);

  navbar.addEventListener("abrir-carrito", () => carrito.open());

  document.body.addEventListener("agregar-carrito", (event) => {
    agregarAlCarrito(event.detail.id, 1);
    const evento = getEventById(event.detail.id);
    showToast(
      `"${evento ? evento.nombre : "Evento"}" agregado al carrito`,
      "success",
    );
  });

  document.body.addEventListener("abrir-detalle", (event) => {
    window.location.hash = `#/evento/${event.detail.id}`;
  });
}

window.addEventListener("DOMContentLoaded", () => {
  montarShell();
  loadRoute();
});

window.addEventListener("hashchange", loadRoute);
