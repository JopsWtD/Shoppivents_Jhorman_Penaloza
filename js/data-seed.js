import { getData, saveData } from "./storage.js";
import { generarVentasDemo } from "./salesSeedGenerator.js";

export function seedData() {
  if (getData("categorias").length === 0) {
    saveData("categorias", [
      {
        id: 1,
        nombre: "Rock",
        descripcion: "Conciertos de bandas y solistas de rock.",
      },
      {
        id: 2,
        nombre: "Pop",
        descripcion:
          "Espectáculos de artistas pop nacionales e internacionales.",
      },
      {
        id: 3,
        nombre: "Urbano",
        descripcion: "Reggaetón, trap y música urbana en general.",
      },
      {
        id: 4,
        nombre: "Vallenato",
        descripcion: "Conciertos de música vallenata y popular.",
      },
    ]);
  }

  if (getData("eventos").length === 0) {
    saveData("eventos", [
      {
        id: 1,
        codigo: "EVT001",
        nombre: "Rock al Parque",
        categoriaId: 1,
        precio: 85000,
        fecha: "2026-08-15",
        hora: "18:00",
        ciudad: "Bogotá",
        imagen: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
        descripcion: "El festival de rock más grande de la ciudad.",
      },
      {
        id: 2,
        codigo: "EVT002",
        nombre: "Noche Vallenata",
        categoriaId: 4,
        precio: 120000,
        fecha: "2026-09-02",
        hora: "20:00",
        ciudad: "Barranquilla",
        imagen: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        descripcion: "Una noche llena de acordeón y tradición.",
      },
      {
        id: 3,
        codigo: "EVT003",
        nombre: "Urban Fest",
        categoriaId: 3,
        precio: 150000,
        fecha: "2026-07-25",
        hora: "19:30",
        ciudad: "Medellín",
        imagen: "https://images.unsplash.com/photo-1459749411177-04a8eb5aad5e",
        descripcion: "Los artistas urbanos más escuchados del momento.",
      },
      {
        id: 4,
        codigo: "EVT004",
        nombre: "Pop Live Session",
        categoriaId: 2,
        precio: 95000,
        fecha: "2026-08-30",
        hora: "19:00",
        ciudad: "Bucaramanga",
        imagen: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
        descripcion: "Una experiencia pop en vivo para toda la familia.",
      },
    ]);
  }

  if (getData("ventas").length === 0) {
    const eventos = getData("eventos");
    saveData("ventas", generarVentasDemo(eventos, 1000));
  }
}
