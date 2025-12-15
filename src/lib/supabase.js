import { createClient } from '@supabase/supabase-js';

// Estos valores deben venir de tu panel de control de Supabase
// Crea un archivo .env.local en la raíz del proyecto con:
// VITE_SUPABASE_URL=tu_url_del_proyecto
// VITE_SUPABASE_ANON_KEY=tu_clave_anonima

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_TOKEN;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;