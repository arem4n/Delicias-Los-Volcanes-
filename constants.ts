
// --- CONFIGURACIÓN DE LA APLICACIÓN ---
// REEMPLAZA ESTOS VALORES con tus propias claves de la Consola de Google Cloud y la URL de Google Apps Script.
export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
export const GAS_WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

// --- CONSTANTES PÚBLICAS ---
export const WHATSAPP_NUMBER = "56934973287";
export const ADMIN_EMAIL = "admin@delicias.cl";

// --- DATOS DE MUESTRA (FALLBACK) ---
export const MOCK_PRODUCTS = [
  {
    id: "1",
    nombre: "Volcán Osorno (La Clásica)",
    descripcion: "Nuestra firma. Galleta de mantequilla sureña con un cráter de manjar casero y lluvia de chocolate belga.",
    precio: 1500,
    stock: 50,
    imagen_url: "https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "2",
    nombre: "Lava de Chocolate (Full Cacao)",
    descripcion: "Para los intensos. Masa de cacao 70% con centro líquido de ganache que explota al morder. Tibia es una locura.",
    precio: 1800,
    stock: 30,
    imagen_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "3",
    nombre: "Nevada de Limón (La Fresca)",
    descripcion: "Inspirada en las cumbres nevadas. Galleta suave de limón sutil, bañada en glaseado real y zest de limón de Pica.",
    precio: 1500,
    stock: 40,
    imagen_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop"
  }
];
