/**
 * Configuración de entorno inyectada en tiempo de build (variables VITE_*).
 * En local se toman de `.env.local`; en el deploy las escribe build_web.py
 * desde SSM (URL de la API consulta). Sin Cognito: la UI es pública.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "",
};
