/**
 * Configuración de entorno inyectada en tiempo de build (variables VITE_*).
 * En local se toman de `.env.local`; en el deploy las escribe build_web.py
 * desde SSM (URL de la API carga e IDs de Cognito).
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  awsRegion: import.meta.env.VITE_AWS_REGION ?? "us-east-2",
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "",
    appClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID ?? "",
  },
};
