// Detecta automáticamente la IP o dominio desde donde se está visitando la página
const hostname = window.location.hostname;

// Asumimos que el backend siempre corre en el puerto 8000 de la misma máquina
export const API_BASE_URL = `http://${hostname}:8000`;
