/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional CDI UNIPAZ (tomada de REPOSITORIO.html).
        unipaz: {
          primary: "#0f2b5c", // azul institucional
          dark: "#091e42", // barra de navegación
          accent: "#00875a", // verde (acciones)
          accentDark: "#006644",
          light: "#f4f5f7", // fondo suave
          line: "#e0e0e0", // bordes
        },
        status: {
          success: "#00875a",
          error: "#c9372c",
          warning: "#b65c02",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
