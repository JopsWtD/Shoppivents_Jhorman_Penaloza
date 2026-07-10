export function getData(key) {

    return JSON.parse(localStorage.getItem(key)) || [];
}

export function saveData(key, data) {
    return localStorage.setItem(key, JSON.stringify(data));
}