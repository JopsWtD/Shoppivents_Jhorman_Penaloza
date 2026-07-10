const NOMBRES = ["Laura", "Carlos", "Mariana", "Andrés", "Camila", "Santiago", "Valentina", "Felipe", "Daniela", "Julián", "Sofía", "Nicolás", "Isabella", "Sebastián", "Manuela", "Alejandro", "Valeria", "Diego", "Paula", "Esteban"];
const APELLIDOS = ["Pérez", "Ramírez", "Gómez", "Rodríguez", "Martínez", "López", "García", "Hernández", "Torres", "Díaz", "Vargas", "Castro", "Rojas", "Morales", "Ortiz"];

function nombreAleatorio() {
    const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    const apellido = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
    return `${nombre} ${apellido}`;
}

function fechaAleatoria(year) {
    const month = Math.floor(Math.random() * 12);
    const dia = 1 + Math.floor(Math.random() * 27);
    const hora = 8 + Math.floor(Math.random() * 12);
    const minuto = Math.floor(Math.random() * 60);

    return new Date(year, month, dia, hora, minuto).toISOString();
}

export function generarVentasDemo(eventos, cantidad = 90) {
    const anioActual = new Date().getFullYear();
    const ventas = [];

    for (let i = 0; i < cantidad; i++) {
        const evento = eventos[Math.floor(Math.random() * eventos.length)];
        const cantidadEntradas = 1 + Math.floor(Math.random() * 4);
        const subtotal = evento.precio * cantidadEntradas;
        const year = anioActual - Math.floor(Math.random() * 2);

        ventas.push({
            id: Date.now() + i,
            fecha: fechaAleatoria(year),
            cliente: {
                identificacion: String(100000000 + Math.floor(Math.random() * 900000000)),
                nombre: nombreAleatorio(),
                direccion: `Calle ${1 + Math.floor(Math.random() * 90)} # ${1 + Math.floor(Math.random() * 40)}-${1 + Math.floor(Math.random() * 90)}`,
                telefono: `300${Math.floor(1000000 + Math.random() * 8999999)}`,
                email: `cliente${i}@mail.com`
            },
            ciudad: evento.ciudad,
            items: [
                {
                    id: evento.id,
                    nombre: evento.nombre,
                    precio: evento.precio,
                    cantidad: cantidadEntradas,
                    subtotal
                }
            ],
            total: subtotal
        });
    }

    return ventas;
}
