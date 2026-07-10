import { getData, saveData } from "../storage.js";
import { getEvents, getCategories } from "./adminHandlers.js";

function normalizar(texto) {
    return (texto || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function buscarEventos({ texto = "", ciudad = "", categoriaId = "" } = {}) {
    const query = normalizar(texto);
    const palabras = query.split(/\s+/).filter(Boolean);

    return getEvents().filter((evento) => {
        if (ciudad && evento.ciudad !== ciudad) return false;
        if (categoriaId && evento.categoriaId !== Number(categoriaId)) return false;
        if (!query) return true;

        const nombre = normalizar(evento.nombre);
        if (nombre.includes(query)) return true;

        return palabras.every((palabra) => nombre.includes(palabra));
    });
}

export function getEventById(id) {
    return getEvents().find((evento) => evento.id === Number(id)) || null;
}

export function getCategoryById(id) {
    return getCategories().find((categoria) => categoria.id === Number(id)) || null;
}

export function getEventosConCategoria() {
    const categorias = getCategories();

    return getEvents().map((evento) => {
        const categoria = categorias.find((item) => item.id === evento.categoriaId);
        return { ...evento, categoriaNombre: categoria ? categoria.nombre : "Evento" };
    });
}

export function getCarrito() {
    return getData("carrito");
}

function guardarCarrito(carrito) {
    saveData("carrito", carrito);
    window.dispatchEvent(new CustomEvent("carrito:actualizado", { detail: { carrito } }));
    return carrito;
}

export function agregarAlCarrito(eventoId, cantidad = 1) {
    const carrito = getCarrito();
    const existente = carrito.find((item) => item.eventoId === eventoId);

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({ eventoId, cantidad });
    }

    return guardarCarrito(carrito);
}

export function quitarDelCarrito(eventoId) {
    const carrito = getCarrito().filter((item) => item.eventoId !== eventoId);
    return guardarCarrito(carrito);
}

export function actualizarCantidad(eventoId, cantidad) {
    const carrito = getCarrito();
    const item = carrito.find((elemento) => elemento.eventoId === eventoId);

    if (!item) return carrito;
    if (cantidad <= 0) return quitarDelCarrito(eventoId);

    item.cantidad = cantidad;
    return guardarCarrito(carrito);
}

export function vaciarCarrito() {
    return guardarCarrito([]);
}

export function getCarritoDetallado() {
    const eventos = getEvents();

    return getCarrito()
        .map((item) => {
            const evento = eventos.find((elemento) => elemento.id === item.eventoId);
            if (!evento) return null;
            return { ...item, evento, subtotal: evento.precio * item.cantidad };
        })
        .filter(Boolean);
}

export function getTotalCarrito() {
    return getCarritoDetallado().reduce((total, item) => total + item.subtotal, 0);
}

export function getCantidadCarrito() {
    return getCarrito().reduce((total, item) => total + item.cantidad, 0);
}

export function crearVenta(cliente) {
    const items = getCarritoDetallado();

    if (items.length === 0) {
        throw new Error("El carrito está vacío, no se puede generar la venta.");
    }

    const venta = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        cliente,
        ciudad: items[0].evento.ciudad,
        items: items.map((item) => ({
            id: item.eventoId,
            nombre: item.evento.nombre,
            precio: item.evento.precio,
            cantidad: item.cantidad,
            subtotal: item.subtotal
        })),
        total: items.reduce((total, item) => total + item.subtotal, 0)
    };

    const ventas = getData("ventas");
    ventas.push(venta);
    saveData("ventas", ventas);
    vaciarCarrito();

    return venta;
}
