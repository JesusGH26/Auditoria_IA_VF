import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo actual
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Intentamos leer API_KEY, si no existe, probamos con GEMINI_API_KEY
  const apiKey = env.API_KEY || env.GEMINI_API_KEY;

  return {
    plugins: [react()],
    define: {
      // Inyectamos la variable para que esté disponible en el frontend como process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Inyectamos variables de Supabase
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_KEY': JSON.stringify(env.VITE_SUPABASE_KEY),
    },
  };
});