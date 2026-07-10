import { getData, saveData } from "../storage.js";

export function getCategories() {
    return getData("categorias");
}

export function createCategory({ nombre, descripcion }) {
    const categorias = getCategories();

    const categoria = {
        id: Date.now(),
        nombre,
        descripcion
    };

    categorias.push(categoria);
    saveData("categorias", categorias);

    return categoria;
}

export function updateCategory(id, { nombre, descripcion }) {
    const categorias = getCategories();
    const index = categorias.findIndex((categoria) => categoria.id === id);

    if (index === -1) return null;

    categorias[index] = { ...categorias[index], nombre, descripcion };
    saveData("categorias", categorias);

    return categorias[index];
}

export function deleteCategory(id) {
    const categorias = getCategories().filter((categoria) => categoria.id !== id);
    saveData("categorias", categorias);
}

export function getEvents() {
    return getData("eventos");
}

export function createEvent(datos) {
    const eventos = getEvents();
    const evento = { id: Date.now(), ...datos };

    eventos.push(evento);
    saveData("eventos", eventos);

    return evento;
}

export function updateEvent(id, datos) {
    const eventos = getEvents();
    const index = eventos.findIndex((evento) => evento.id === id);

    if (index === -1) return null;

    eventos[index] = { ...eventos[index], ...datos };
    saveData("eventos", eventos);

    return eventos[index];
}

export function deleteEvent(id) {
    const eventos = getEvents().filter((evento) => evento.id !== id);
    saveData("eventos", eventos);
}

export function getSales() {
    return getData("ventas").sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export function getSaleById(id) {
    return getData("ventas").find((venta) => venta.id === id);
}

export function getSaleYears() {
    const currentYear = new Date().getFullYear();
    const salesYears = getSales().map((venta) => new Date(venta.fecha).getFullYear());

    const minYear = Math.min(currentYear - 5, ...salesYears);
    const maxYear = Math.max(currentYear, ...salesYears);

    const years = [];

    for (let year = maxYear; year >= minYear; year--) {
        years.push(year);
    }

    return years;
}

export function getSaleReportByDate(year, month) {
    const eventos = getEvents();

    const ventasDelMes = getSales().filter((venta) => {
        const fecha = new Date(venta.fecha);
        return fecha.getFullYear() === year && fecha.getMonth() + 1 === month;
    });

    const acumulado = new Map();

    ventasDelMes.forEach((venta) => {
        venta.items.forEach((item) => {
            const evento = eventos.find((elemento) => elemento.id === item.id);
            const cantidad = item.cantidad || 1;
            const subtotal = item.subtotal || item.precio * cantidad;

            if (!acumulado.has(item.id)) {
                acumulado.set(item.id, {
                    codigo: evento ? evento.codigo : "N/D",
                    nombre: item.nombre,
                    cantidad: 0,
                    total: 0
                });
            }

            const registro = acumulado.get(item.id);
            registro.cantidad += cantidad;
            registro.total += subtotal;
        });
    });

    const filas = [...acumulado.values()].sort((a, b) => b.total - a.total);
    const totalGeneral = filas.reduce((total, fila) => total + fila.total, 0);

    return {
        filas,
        totalGeneral,
        cantidadVentas: ventasDelMes.length
    };
}