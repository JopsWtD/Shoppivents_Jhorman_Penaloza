import { saveData } from "./storage.js";

const ADMIN_EMAIL = "admin@mail.com";
const ADMIN_PASSWORD = "123456";

export function login(email, password) {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        saveData("sesionAdmin", { email, fecha: new Date().toISOString() });
        return true;
    }

    return false;
}

export function logout() {
    localStorage.removeItem("sesionAdmin");
}

export function isAuthenticated() {
    return localStorage.getItem("sesionAdmin") !== null;
}
