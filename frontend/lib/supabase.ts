import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu archivo .env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

// Creamos el cliente solo si las variables existen
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;